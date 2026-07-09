import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const MOCK_COMM_DRAFTS: { [lang: string]: { short: string; long: string; alert: string } } = {
  en: {
    short: "Due to queue congestion, please proceed to Gate 3 or Gate 5 for rapid stadium entry.",
    long: "FIFA World Cup operations has detected queue congestion at Gate 4. To minimize delays, all spectators currently arriving are redirected to Gate 3 (East) and Gate 5 (South). Stewards are stationed along the corridors to assist.",
    alert: "EMERGENCY UPDATE: Gate 4 turnstiles are temporarily suspended. Do not head to Gate 4. Please proceed immediately to Gate 3 or Gate 5."
  },
  es: {
    short: "Debido a la congestión de filas, diríjase a la Puerta 3 o 5 para un ingreso rápido.",
    long: "Las operaciones de la Copa Mundial de la FIFA han detectado congestión en la Puerta 4. Para minimizar retrasos, todos los espectadores que lleguen serán redirigidos a la Puerta 3 (Este) y Puerta 5 (Sur). Los auxiliares le guiarán.",
    alert: "ACTUALIZACIÓN DE EMERGENCIA: Los torniquetes de la Puerta 4 están suspendidos temporalmente. No se dirija a la Puerta 4. Diríjase a la Puerta 3 o 5 inmediatamente."
  },
  fr: {
    short: "En raison d'encombrements, veuillez vous diriger vers la Porte 3 ou la Porte 5 pour entrer.",
    long: "Les services d'exploitation ont détecté un encombrement à la Porte 4. Pour minimiser l'attente, tous les spectateurs arrivant maintenant sont redirigés vers la Porte 3 (Est) et la Porte 5 (Sud).",
    alert: "ALERTE URGENCE: Les tourniquets de la Porte 4 sont temporairement suspendus. Évitez la Porte 4. Dirigez-vous immédiatement vers la Porte 3 ou la Porte 5."
  },
  pt: {
    short: "Devido ao congestionamento de filas, dirija-se ao Portão 3 ou Portão 5 para entrada rápida.",
    long: "As operações da Copa do Mundo detectaram congestionamento no Portão 4. Para reduzir o tempo de espera, os torcedores estão sendo redirecionados para o Portão 3 (Leste) e Portão 5 (Sul).",
    alert: "ALERTA DE EMERGÊNCIA: As catracas do Portão 4 estão temporariamente suspensas. Evite o Portão 4. Siga imediatamente para o Portão 3 ou 5."
  },
  ar: {
    short: "بسبب ازدحام الطوابير، يرجى التوجه إلى البوابة 3 أو البوابة 5 للدخول السريع.",
    long: "رصدت عمليات كأس العالم ازدحاماً عند البوابة 4. لتقليل التأخير، يتم توجيه جميع المشجعين القادمين حالياً إلى البوابة 3 (الشرقية) والبوابة 5 (الجنوبية).",
    alert: "تحديث طارئ: تم تعليق بوابات الدوران في البوابة 4 مؤقتاً. يرجى التوجه فوراً إلى البوابة 3 أو البوابة 5."
  },
  hi: {
    short: "भीड़ के कारण, त्वरित स्टेडियम प्रवेश के लिए कृपया गेट 3 या गेट 5 पर जाएँ।",
    long: "फीफा विश्व कप ऑपरेशंस ने गेट 4 पर भीड़ का पता लगाया है। देरी को कम करने के लिए, सभी दर्शकों को गेट 3 (पूर्व) और गेट 5 (दक्षिण) पर भेजा जा रहा है।",
    alert: "आपातकालीन अद्यतन: गेट 4 टर्नस्टाइल अस्थायी रूप से निलंबित हैं। कृपया तुरंत गेट 3 या गेट 5 पर जाएं।"
  },
  ja: {
    short: "混雑のため、スタadiumへの迅速な入場の目的でゲート3またはゲート5へお進みください。",
    long: "ゲート4で混雑が検知されました。待ち時間を最小限に抑えるため、ご来場の皆様はゲート3（東）またはゲート5（南）へ迂回してください。",
    alert: "緊急アップデート：ゲート4の改札口は一時停止しています。ゲート4には向かわず、直ちにゲート3またはゲート5にお進みください。"
  },
  ko: {
    short: "대기 줄 혼잡으로 인해 빠른 입장을 원하시면 3번 또는 5번 게이트로 이동해 주십시오.",
    long: "게이트 4의 혼잡이 감지되었습니다. 지연을 최소화하기 위해 도착하는 관람객은 3번 게이트(동쪽) 및 5번 게이트(남쪽)로 안내되고 있습니다.",
    alert: "긴급 공지: 게이트 4 회전문 운영이 일시 중단되었습니다. 게이트 4로 가지 마시고, 즉시 3번 또는 5번 게이트로 이동하십시오."
  },
  de: {
    short: "Wegen Überlastung weichen Sie bitte auf Tor 3 oder Tor 5 aus, um schneller ins Stadion zu gelangen.",
    long: "FIFA World Cup Operations hat Staus an Tor 4 festgestellt. Um Verzögerungen zu vermeiden, werden alle ankommenden Zuschauer auf Tor 3 (Ost) und Tor 5 (Süd) umgeleitet.",
    alert: "DRINGENDE MELDUNG: Tor 4 Drehkreuze sind vorübergehend gesperrt. Bitte weichen Sie sofort auf Tor 3 oder Tor 5 aus."
  }
};

export async function POST(req: NextRequest) {
  try {
    const { operatorPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "PLACEHOLDER_KEY") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const promptText = `You are a translator and media broadcast drafts generator for FIFA World Cup 2026 stadium operations.
The operator typed this issue prompt: "${operatorPrompt}"

Generate drafts of announcements based on this prompt. You must generate it for 9 languages:
English (en), Spanish (es), French (fr), Portuguese (pt), Arabic (ar), Hindi (hi), Japanese (ja), Korean (ko), German (de).

For each language, provide:
1. Short PA announcement (maximum 15 words)
2. Long visual text description (stadium screen copy, around 40-50 words)
3. Emergency push alert text (maximum 20 words)

Your response must be JSON formatted precisely as follows:
{
  "en": { "short": "...", "long": "...", "alert": "..." },
  "es": { "short": "...", "long": "...", "alert": "..." },
  ...
}

Return ONLY raw valid JSON text inside. Do not surround it with markdown fences.`;

      const response = await model.generateContent(promptText);
      const text = response.response.text().trim();
      
      // Clean JSON in case LLM wraps it in ```json
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const cleanJson = text.substring(jsonStart, jsonEnd);

      return new Response(cleanJson, {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Default Fallback JSON
    return new Response(JSON.stringify(MOCK_COMM_DRAFTS), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Announcement Studio API error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
