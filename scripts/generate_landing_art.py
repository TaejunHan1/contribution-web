from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LANDING = ROOT / "public" / "landing"
GENERATED = LANDING / "generated"
OUT = LANDING / "art"
FINAL = LANDING / "final"
OUT.mkdir(parents=True, exist_ok=True)
FINAL.mkdir(parents=True, exist_ok=True)

FONT = "/System/Library/Fonts/AppleSDGothicNeo.ttc"

INK = (30, 31, 27)
MUTED = (96, 91, 82)
GREEN = (34, 51, 41)
SAGE = (116, 135, 107)
IVORY = (249, 245, 237)
LINE = (224, 216, 204)
WHITE = (255, 255, 255)


def font(size, weight="regular"):
    index = {"regular": 0, "medium": 4, "bold": 8, "heavy": 9}.get(weight, 0)
    return ImageFont.truetype(FONT, size=size, index=index)


def draw_text(draw, xy, text, size, fill=INK, weight="regular", spacing=8, anchor=None):
    draw.multiline_text(xy, text, font=font(size, weight), fill=fill, spacing=spacing, anchor=anchor)


def draw_shadow_text(draw, xy, text, size, fill=INK, weight="regular", spacing=8, anchor=None):
    x, y = xy
    shadow = (255, 253, 247)
    draw.multiline_text((x + 2, y + 2), text, font=font(size, weight), fill=shadow, spacing=spacing, anchor=anchor)
    draw.multiline_text(xy, text, font=font(size, weight), fill=fill, spacing=spacing, anchor=anchor)


def text_bottom(draw, xy, text, size, weight="regular", spacing=8):
    box = draw.multiline_textbbox(xy, text, font=font(size, weight), spacing=spacing)
    return box[3]


def button(draw, box, label, fill=GREEN, text_fill=WHITE):
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=fill)
    draw_text(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), label, 25, fill=text_fill, weight="heavy", anchor="mm")


def cover_image(path, size, focus=(0.5, 0.5)):
    img = Image.open(path).convert("RGB")
    sw, sh = img.size
    tw, th = size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    fx, fy = focus
    left = int((nw - tw) * fx)
    top = int((nh - th) * fy)
    left = max(0, min(left, nw - tw))
    top = max(0, min(top, nh - th))
    return img.crop((left, top, left + tw, top + th))


def photo_canvas(path, size, focus=(0.5, 0.5), brighten=1.0):
    base = cover_image(path, size, focus).convert("RGBA")
    if brighten != 1.0:
        wash = Image.new("RGBA", size, (255, 255, 255, int(255 * (brighten - 1.0))))
        base = Image.alpha_composite(base, wash)
    return base


def gradient_overlay(size, side="left", strength=235):
    w, h = size
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    px = overlay.load()
    for x in range(w):
        t = x / max(1, w - 1)
        if side == "left":
            alpha = int(strength * max(0, 1 - t * 1.55))
        elif side == "right":
            alpha = int(strength * max(0, (t - 0.28) / 0.72))
        else:
            alpha = int(strength * max(0, 1 - abs(t - 0.5) * 2))
        for y in range(h):
            px[x, y] = (249, 245, 237, alpha)
    return overlay


def vignette(size):
    w, h = size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rectangle((0, 0, w, h), fill=25)
    d.rounded_rectangle((50, 50, w - 50, h - 50), radius=70, fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(60))
    return Image.new("RGBA", size, (40, 32, 22, 0)).putalpha(mask) if False else mask


def rounded_shadow(base, box, radius=40, alpha=38, blur=28, offset=(0, 20)):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x1, y1, x2, y2 = box
    ox, oy = offset
    d.rounded_rectangle((x1 + ox, y1 + oy, x2 + ox, y2 + oy), radius=radius, fill=(45, 37, 26, alpha))
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def glass_panel(base, box, radius=44, fill=(255, 253, 248, 226)):
    rounded_shadow(base, box, radius=radius, alpha=28, blur=32, offset=(0, 18))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=(255, 255, 255, 130), width=2)


def nav_bar():
    img = Image.new("RGBA", (1800, 160), IVORY)
    d = ImageDraw.Draw(img)
    logo_path = LANDING / "jeongdamlogo.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((54, 54), Image.Resampling.LANCZOS)
        img.alpha_composite(logo, (152, 47))
    draw_text(d, (222, 54), "정담", 30, fill=INK, weight="heavy")
    draw_text(d, (222, 91), "청첩장부터 접수와 정산까지", 18, fill=MUTED, weight="bold")
    d.rounded_rectangle((570, 40, 1268, 108), radius=34, fill=(255, 255, 255, 238), outline=LINE, width=1)
    for x, label in [(676, "서비스 소개"), (838, "청첩장"), (986, "접수 운영"), (1140, "기록 관리")]:
        draw_text(d, (x, 74), label, 22, fill=(72, 68, 61), weight="heavy", anchor="mm")
    button(d, (1450, 38, 1648, 110), "도입 상담")
    save(img, "nav-final.png")


def save(img, name):
    img.convert("RGB").save(FINAL / name, quality=95)
    img.convert("RGB").save(OUT / name.replace("-final", ""), quality=95)


def desktop_section(name, scene, headline, sub, kicker=None, side="left", focus=(0.5, 0.5), bullets=None, cta=None):
    size = (1800, 1010)
    img = photo_canvas(GENERATED / scene, size, focus=focus)
    img.alpha_composite(gradient_overlay(size, side=side, strength=248))
    d = ImageDraw.Draw(img)

    if side == "left":
        x = 150
    else:
        x = 1035

    y = 230
    if kicker:
        draw_shadow_text(d, (x, y), kicker, 30, fill=SAGE, weight="heavy")
        y += 72
    draw_shadow_text(d, (x, y), headline, 74, fill=INK, weight="heavy", spacing=10)
    y = text_bottom(d, (x, y), headline, 76, weight="heavy", spacing=12) + 42
    draw_shadow_text(d, (x + 4, y), sub, 32, fill=MUTED, weight="bold", spacing=10)
    y = text_bottom(d, (x + 4, y), sub, 34, weight="bold", spacing=12) + 50

    if bullets:
        for item in bullets:
            d.ellipse((x + 4, y + 7, x + 24, y + 27), fill=GREEN)
            draw_shadow_text(d, (x + 44, y), item, 27, fill=INK, weight="heavy")
            y += 58
    if cta:
        button(d, (x, y + 20, x + 210, y + 88), cta)

    save(img, name)


def mobile_section(name, scene, headline, sub, kicker=None, focus=(0.5, 0.5), bullets=None, cta=None):
    size = (900, 1400)
    img = photo_canvas(GENERATED / scene, size, focus=focus)
    top = Image.new("RGBA", size, (249, 245, 237, 0))
    px = top.load()
    for y in range(size[1]):
        alpha = int(238 * max(0, 1 - y / 980))
        for x in range(size[0]):
            px[x, y] = (249, 245, 237, alpha)
    img.alpha_composite(top)
    d = ImageDraw.Draw(img)
    y = 125
    if kicker:
        draw_shadow_text(d, (78, y), kicker, 26, fill=SAGE, weight="heavy")
        y += 64
    draw_shadow_text(d, (78, y), headline, 56, fill=INK, weight="heavy", spacing=8)
    y = text_bottom(d, (78, y), headline, 56, weight="heavy", spacing=8) + 34
    draw_shadow_text(d, (80, y), sub, 28, fill=MUTED, weight="bold", spacing=9)
    y = text_bottom(d, (80, y), sub, 28, weight="bold", spacing=9) + 42
    if bullets:
        for item in bullets:
            d.ellipse((82, y + 8, 102, y + 28), fill=GREEN)
            draw_shadow_text(d, (122, y), item, 25, fill=INK, weight="heavy")
            y += 54
    if cta:
        button(d, (78, y + 20, 288, y + 86), cta)
    save(img, name)


def feature_sections():
    size = (1800, 1010)
    img = photo_canvas(GENERATED / "service-overview-scene-v4.png", size, focus=(0.62, 0.5))
    img.alpha_composite(gradient_overlay(size, side="left", strength=246))
    d = ImageDraw.Draw(img)
    x, y = 150, 148
    draw_shadow_text(d, (x, y), "정담에서 할 수 있는 일", 30, fill=SAGE, weight="heavy")
    y += 78
    draw_shadow_text(d, (x, y), "예식 준비와 당일 접수를\n하나의 흐름으로", 68, fill=INK, weight="heavy", spacing=10)
    y = text_bottom(d, (x, y), "예식 준비와 당일 접수를\n하나의 흐름으로", 68, weight="heavy", spacing=10) + 42
    features = [
        ("모바일 청첩장", "사진, 음악, 지도, 방명록을 담은 초대 링크"),
        ("종이 청첩장", "인쇄용 청첩장 편집과 PDF 내보내기"),
        ("태블릿 방명록", "하객이 이름을 쓰면 접수 기록 생성"),
        ("축의금 입력", "금액, 관계, 미확정 내역을 현장에서 저장"),
        ("식권 정산", "나간 식권 수량과 잔여 흐름 확인"),
        ("행사 후 기록", "누가 얼마를 했는지 검색하고 관리"),
    ]
    for title, body in features:
        d.line((x, y, x + 690, y), fill=(174, 166, 150), width=2)
        draw_shadow_text(d, (x, y + 22), title, 28, fill=INK, weight="heavy")
        draw_shadow_text(d, (x + 205, y + 25), body, 23, fill=MUTED, weight="bold")
        y += 78
    save(img, "features-final.png")

    m_size = (900, 1800)
    m = photo_canvas(GENERATED / "service-overview-scene-v4.png", m_size, focus=(0.62, 0.5))
    top = Image.new("RGBA", m_size, (249, 245, 237, 0))
    px = top.load()
    for yy in range(m_size[1]):
        alpha = int(252 * max(0, 1 - yy / 1420))
        for xx in range(m_size[0]):
            px[xx, yy] = (249, 245, 237, alpha)
    m.alpha_composite(top)
    dm = ImageDraw.Draw(m)
    x, y = 78, 115
    draw_shadow_text(dm, (x, y), "정담 기능", 26, fill=SAGE, weight="heavy")
    y += 66
    draw_shadow_text(dm, (x, y), "예식 준비와 접수를\n하나의 흐름으로", 52, fill=INK, weight="heavy", spacing=8)
    y = text_bottom(dm, (x, y), "예식 준비와 접수를\n하나의 흐름으로", 52, weight="heavy", spacing=8) + 38
    for title, body in features:
        dm.line((x, y, 760, y), fill=(159, 151, 135), width=2)
        draw_shadow_text(dm, (x, y + 20), title, 25, fill=INK, weight="heavy")
        draw_shadow_text(dm, (x, y + 54), body, 20, fill=MUTED, weight="bold")
        y += 114
    save(m, "features-mobile-final.png")


def detail_sections():
    desktop_section(
        "invitation-final.png",
        "invitation-studio-scene-v3.png",
        "모바일과 종이 청첩장을\n함께 준비",
        "초대 링크와 인쇄용 청첩장을\n하나의 스튜디오에서 만듭니다.",
        kicker="청첩장 제작",
        side="left",
        focus=(0.66, 0.5),
        bullets=["사진·음악·지도 구성", "A6 종이 청첩장 편집", "PDF 내보내기와 공유"],
        cta="청첩장 보기",
    )
    mobile_section(
        "invitation-mobile-final.png",
        "invitation-studio-scene-v3.png",
        "모바일과 종이 청첩장을\n함께 준비",
        "초대 링크와 인쇄용 청첩장을\n하나의 스튜디오에서 만듭니다.",
        kicker="청첩장 제작",
        focus=(0.66, 0.5),
        bullets=["모바일 초대 링크", "종이 청첩장 편집", "PDF 내보내기"],
        cta="청첩장 보기",
    )

    desktop_section(
        "reception-final.png",
        "reception-operation-scene-v3.png",
        "접수대 운영을\n태블릿으로",
        "하객은 이름을 쓰고,\n접수자는 축의금과 식권을 저장합니다.",
        kicker="예식 당일 접수",
        side="left",
        focus=(0.72, 0.5),
        bullets=["신랑측·신부측 구분", "축의금과 식권 입력", "미확정 기록 표시"],
        cta="접수 운영",
    )
    mobile_section(
        "reception-mobile-final.png",
        "reception-operation-scene-v3.png",
        "접수대 운영을\n태블릿으로",
        "이름, 축의금, 식권을\n현장에서 바로 저장합니다.",
        kicker="예식 당일 접수",
        focus=(0.72, 0.5),
        bullets=["양가 구분", "금액·식권 입력", "미확정 기록"],
        cta="접수 운영",
    )

    desktop_section(
        "owner-final.png",
        "owner-dashboard-scene-v3.png",
        "주최자는\n실시간으로 확인",
        "참석자, 축의금, 식권 수량,\n미확정 내역을 한 화면에서 봅니다.",
        kicker="관리자 화면",
        side="left",
        focus=(0.72, 0.5),
        bullets=["전체 합계와 상세 목록", "하객 이름 검색", "행사 후 감사 기록"],
        cta="관리 화면",
    )
    mobile_section(
        "owner-mobile-final.png",
        "owner-dashboard-scene-v3.png",
        "주최자는\n실시간으로 확인",
        "축의금, 식권, 하객 기록을\n한 화면에서 관리합니다.",
        kicker="관리자 화면",
        focus=(0.72, 0.5),
        bullets=["전체 합계", "하객 검색", "감사 기록"],
        cta="관리 화면",
    )


def contact_section():
    size = (1800, 700)
    img = photo_canvas(GENERATED / "hero-scene-v2.png", size, focus=(0.7, 0.5))
    img.alpha_composite(Image.new("RGBA", size, (249, 245, 237, 150)))
    d = ImageDraw.Draw(img)
    draw_shadow_text(d, (900, 215), "정담", 32, fill=SAGE, weight="heavy", anchor="mm")
    draw_shadow_text(d, (900, 305), "결혼식 접수 문화를 바꾸는 앱", 70, fill=INK, weight="heavy", anchor="mm")
    draw_shadow_text(d, (900, 390), "종이 방명록의 익숙함은 남기고, 기록과 정산은 실시간으로 정리합니다.", 32, fill=MUTED, weight="bold", anchor="mm")
    button(d, (770, 460, 1030, 532), "정담 도입 문의")
    save(img, "contact-final.png")

    m = photo_canvas(GENERATED / "hero-scene-v2.png", (900, 1000), focus=(0.7, 0.5))
    m.alpha_composite(Image.new("RGBA", (900, 1000), (249, 245, 237, 160)))
    dm = ImageDraw.Draw(m)
    draw_shadow_text(dm, (450, 255), "정담", 30, fill=SAGE, weight="heavy", anchor="mm")
    draw_shadow_text(dm, (450, 350), "결혼식 접수 문화를\n바꾸는 앱", 58, fill=INK, weight="heavy", spacing=10, anchor="mm")
    draw_shadow_text(dm, (450, 505), "익숙한 접수 흐름은 남기고\n기록과 정산은 실시간으로 정리합니다.", 28, fill=MUTED, weight="bold", spacing=10, anchor="mm")
    button(dm, (315, 625, 585, 695), "정담 도입 문의")
    save(m, "contact-mobile-final.png")


def main():
    nav_bar()
    desktop_section(
        "hero-final.png",
        "hero-scene-v2.png",
        "결혼식 접수,\n종이 대신 태블릿으로",
        "이름을 쓰고 축의금과 식권을 입력하면\n행사 기록이 바로 정리됩니다.",
        kicker="대한민국 결혼식 접수대 그대로",
        side="left",
        focus=(0.72, 0.5),
        cta="접수 흐름",
    )
    mobile_section(
        "hero-mobile-final.png",
        "hero-scene-v2.png",
        "결혼식 접수,\n종이 대신 태블릿으로",
        "이름, 축의금, 식권 기록이\n실시간으로 정리됩니다.",
        kicker="대한민국 결혼식 접수대 그대로",
        focus=(0.72, 0.5),
        cta="접수 흐름",
    )
    feature_sections()
    detail_sections()
    desktop_section(
        "problems-final.png",
        "problem-scene-v2.png",
        "종이 방명록이\n남기는 일",
        "행사 후 다시 맞춰보던 기록을\n처음부터 정확하게 남깁니다.",
        kicker="기존 접수대의 문제",
        side="right",
        focus=(0.34, 0.5),
        bullets=["손글씨 해독", "봉투와 명단 대조", "식권 수량 재계산"],
    )
    mobile_section(
        "problems-mobile-final.png",
        "problem-scene-v2.png",
        "종이 방명록이\n남기는 일",
        "행사 후 다시 맞춰보던 기록을\n처음부터 정확하게 남깁니다.",
        kicker="기존 접수대의 문제",
        focus=(0.36, 0.5),
        bullets=["손글씨 해독", "봉투·명단 대조", "식권 재계산"],
    )
    desktop_section(
        "flow-final.png",
        "flow-scene-v2.png",
        "접수 흐름은\n그대로",
        "하객은 이름을 쓰고,\n접수자는 금액과 식권만 입력합니다.",
        kicker="정담 접수 방식",
        side="left",
        focus=(0.72, 0.5),
        bullets=["이름 작성", "축의금 입력", "식권 수량 저장", "실시간 합계 확인"],
    )
    mobile_section(
        "flow-mobile-final.png",
        "flow-scene-v2.png",
        "접수 흐름은\n그대로",
        "하객은 이름을 쓰고,\n접수자는 금액과 식권만 입력합니다.",
        kicker="정담 접수 방식",
        focus=(0.72, 0.5),
        bullets=["이름 작성", "축의금 입력", "식권 저장"],
    )
    desktop_section(
        "records-final.png",
        "records-scene-v2.png",
        "행사 후 기록도\n바로 찾게",
        "누가 얼마를 했는지,\n식권은 몇 장 나갔는지 검색합니다.",
        kicker="행사 후 기록 관리",
        side="right",
        focus=(0.38, 0.5),
        bullets=["하객별 검색", "관계별 정리", "미확정 내역 관리"],
        cta="기록 관리",
    )
    mobile_section(
        "records-mobile-final.png",
        "records-scene-v2.png",
        "행사 후 기록도\n바로 찾게",
        "축의금, 식권, 하객 기록을\n행사 후에도 확인합니다.",
        kicker="행사 후 기록 관리",
        focus=(0.38, 0.5),
        bullets=["하객별 검색", "관계별 정리", "미확정 내역"],
        cta="기록 관리",
    )
    contact_section()
    print(f"generated landing images in {FINAL}")


if __name__ == "__main__":
    main()
