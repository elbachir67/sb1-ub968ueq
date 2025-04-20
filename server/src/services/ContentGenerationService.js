import OpenAI from "openai";
import { GeneratedContent } from "../models/GeneratedContent.js";
import { logger } from "../utils/logger.js";

class ContentGenerationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(params) {
    try {
      const {
        topic,
        userLevel,
        learningStyle,
        previousPerformance,
        contentType,
      } = params;

      let generatedContent;

      try {
        // Essayer d'abord avec OpenAI
        const completion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: this.buildPrompt(params) }],
          temperature: 0.7,
        });
        generatedContent = completion.choices[0].message.content;
      } catch (openaiError) {
        logger.warn(
          "OpenAI API error, using fallback content generation:",
          openaiError
        );
        generatedContent = this.generateFallbackContent(params);
      }

      // Sauvegarder dans MongoDB
      const content = new GeneratedContent({
        topic,
        content: generatedContent,
        userLevel,
        learningStyle,
        contentType,
        performanceContext: previousPerformance,
      });

      await content.save();
      logger.info(`Generated content for topic: ${topic}`);

      return { content: generatedContent };
    } catch (error) {
      logger.error("Error generating content:", error);
      throw error;
    }
  }

  buildPrompt(params) {
    const {
      topic,
      userLevel,
      learningStyle,
      previousPerformance,
      contentType,
    } = params;
    return `Generate a ${contentType} about ${topic} for a ${userLevel} level student 
      with ${learningStyle} learning style. Their previous performance was ${previousPerformance}%.
      Focus on ${
        previousPerformance < 70 ? "basic concepts" : "advanced applications"
      }.`;
  }

  generateFallbackContent(params) {
    const { topic, userLevel, contentType, previousPerformance } = params;

    // Générer du contenu basique basé sur les paramètres
    const templates = {
      explanation: {
        basic: `Introduction aux concepts de base de ${topic}. 
                Les points clés à comprendre sont les fondamentaux et la terminologie essentielle.
                Nous allons explorer ce sujet étape par étape, en commençant par les concepts les plus simples.`,
        intermediate: `Exploration approfondie de ${topic}.
                      Nous aborderons les concepts intermédiaires et leurs applications pratiques.
                      Cette section nécessite une compréhension des bases et introduit des notions plus avancées.`,
        advanced: `Analyse avancée de ${topic}.
                  Nous examinerons les concepts complexes et leurs implications théoriques et pratiques.
                  Cette section s'adresse aux apprenants ayant une solide compréhension du sujet.`,
      },
      exercise: {
        basic: `Exercices pratiques sur ${topic}.
                Commencez par ces exercices simples pour renforcer votre compréhension des concepts de base.
                Chaque exercice se concentre sur un aspect fondamental.`,
        intermediate: `Exercices d'application sur ${topic}.
                      Ces exercices de niveau intermédiaire vous permettront de mettre en pratique vos connaissances.
                      Ils combinent plusieurs concepts et nécessitent une réflexion plus approfondie.`,
        advanced: `Exercices avancés sur ${topic}.
                  Ces exercices complexes testent votre maîtrise approfondie du sujet.
                  Ils nécessitent une compréhension complète et une capacité d'analyse poussée.`,
      },
      summary: {
        basic: `Résumé des points clés de ${topic}.
                Les concepts fondamentaux à retenir sont listés de manière claire et concise.
                Ce résumé couvre les bases essentielles du sujet.`,
        intermediate: `Synthèse détaillée de ${topic}.
                      Ce résumé couvre les concepts intermédiaires et leurs interconnexions.
                      Il met en évidence les points importants et leurs applications.`,
        advanced: `Synthèse approfondie de ${topic}.
                  Ce résumé analyse les concepts avancés et leurs implications.
                  Il établit des liens entre différents aspects du sujet et explore les nuances.`,
      },
    };

    const level =
      previousPerformance < 50
        ? "basic"
        : previousPerformance < 80
        ? "intermediate"
        : "advanced";

    return templates[contentType][level];
  }

  async getGeneratedContent(filters) {
    try {
      const query = {};

      if (filters.topic) query.topic = filters.topic;
      if (filters.userLevel) query.userLevel = filters.userLevel;
      if (filters.contentType) query.contentType = filters.contentType;

      const content = await GeneratedContent.find(query)
        .sort({ createdAt: -1 })
        .limit(10);

      return content;
    } catch (error) {
      logger.error("Error fetching generated content:", error);
      throw error;
    }
  }
}

export default new ContentGenerationService();
