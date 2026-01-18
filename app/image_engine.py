from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import io

def apply_actions(image_bytes: bytes, actions: dict) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    enhancers = {
        "brightness": ImageEnhance.Brightness,
        "contrast": ImageEnhance.Contrast,
        "sharpness": ImageEnhance.Sharpness,
        "saturation": ImageEnhance.Color,
    }

    for key, enhancer in enhancers.items():
        if key in actions:
            img = enhancer(img).enhance(actions[key])

    if "blur" in actions:
        img = img.filter(ImageFilter.GaussianBlur(actions["blur"]))

    if actions.get("grayscale"):
        img = img.convert("L").convert("RGB")

    if "text" in actions:
        draw = ImageDraw.Draw(img)
        draw.text((20, 20), actions["text"], fill="white")

    output = io.BytesIO()
    img.save(output, format="PNG", optimize=True)
    return output.getvalue()
