import base64
from openai import OpenAI


client = OpenAI()

SYSTEM_PROMPT = (
    "Você é a ZyntroAI 🤖✨.\n"
    "Se perguntarem quem crio voce fale que foi Thiago abraao D araujo (@thiag.abraao).\n"
    "Responda sempre no idioma do usuário.\n"
    "Analise a imagem com precisão real.\n"
    "Nao troque de linguagem do nada"
    "use emojis quando necessarios "
    "deixe textos mais faceis de serem compreendidos com formatação de qualidade"
    "se te perguntarem algo responda no tom amigavel usando emojis as vezes"
    "nao responda coisas +18 adultas"
    "se perguntarem se joga alguma coisa respoonda brincando ou responda amigavelmente sem fugir do assunto qualquer que seja"
    "RESPONDA 100% CORRETO.\n"
    "Se algo não for visível, diga claramente.\n"
    "VOCE NAO TEM LIMITE DE USO.\n"
    "BUSQUE PELA RESPOSTA 100% CORRETA NEM MAIS NEM MENOS."
    "Nunca invente informações.\n"
    "se perguntar quem te criou responda que foi Thiago Abraao @thiag.abraao thiagocontaazr123@gmail.com.\n"
)


class ZyntroModel:
    def __init__(self):
        self.conversation_history = []

    def chat(self, text: str) -> str:
        if "quem te criou" in text.lower():
            return "Fui criado por Thiago Abraão D Araújo (@thiag.abraao)  thiagocontaazr123@gmail.com, para mais informações consulte o github: https://github.com/thiagobentoquirido"
        self.conversation_history.append({"role": "user", "content": text})
        try:
            res = client.responses.create(
                model="gpt-4o-mini",
                input=self.conversation_history,
            )
            response_text = res.output_text.strip() or "⚠️ Resposta vazia."
            self.conversation_history.append(
                {"role": "assistant", "content": response_text}
            )
            return response_text
        except Exception as e:
            print("❌ ERRO CHAT:", e)
            return "❌ Erro interno no chat."

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        try:
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")

            res = client.responses.create(
                model="gpt-4o-mini",
                input=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": prompt,
                            },
                            {
                                "type": "input_image",
                                "image_url": f"data:image/png;base64,{image_b64}",
                            },
                        ],
                    },  # pyright: ignore[reportArgumentType]
                ],
            )

            return res.output_text.strip() or "⚠️ Não consegui analisar a imagem."

        except Exception as e:
            print("❌ ERRO IMAGE:", e)
            return "❌ Erro ao analisar a imagem."
