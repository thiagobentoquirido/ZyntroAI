import ollama

VISION_SYSTEM = """
Você é a ZyntroAI 🤖✨.

TAREFA:
- Analise a imagem com atenção
- Leia textos visíveis (OCR)
- Entenda pessoas, objetos, ações e contexto
- Responda EXATAMENTE a pergunta do usuário
- Se for pergunta → responda
- Se for descrição → descreva
- Se não der para saber → diga claramente

REGRAS:
- Use SOMENTE informações da imagem
- Responda no mesmo idioma do usuário
- Seja claro, direto e completo
- Não invente
"""

def analyze_image(image_bytes: bytes, user_prompt: str) -> str:
    res = ollama.chat(
        model="llava:phi3",
        messages=[
            {
                "role": "user",
                "content": f"{VISION_SYSTEM}\n\nPergunta do usuário:\n{user_prompt}",
                "images": [image_bytes],
            }
        ],
        options={
            "temperature": 0.1,
            "num_predict": 180,
        },
    )

    return res["message"]["content"]
