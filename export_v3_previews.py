import os
from pptx import Presentation as PptxPresentation
from pptx.util import Inches
from spire.presentation import Presentation as SpirePresentation

import generate_core_tech_ppt_judge_v3 as deck

BASE_DIR = r"d:/project/pain_alleviation"
OUT_DIR = os.path.join(BASE_DIR, "slide_preview_v3_round3")
TMP_DIR = os.path.join(BASE_DIR, "_tmp_preview_build")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

builders = [deck.slide_1, deck.slide_2, deck.slide_3, deck.slide_4]

for idx, build_fn in enumerate(builders, start=1):
    tmp_pptx = os.path.join(TMP_DIR, f"slide_{idx}.pptx")
    out_png = os.path.join(OUT_DIR, f"slide_{idx}.png")

    prs = PptxPresentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    build_fn(prs)
    prs.save(tmp_pptx)

    sp = SpirePresentation()
    sp.LoadFromFile(tmp_pptx)
    stream = sp.Slides.get_Item(0).SaveAsImage()
    stream.Save(out_png)
    sp.Dispose()

print("exported", OUT_DIR)
