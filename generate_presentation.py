import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]

    # Color Palette
    PRIMARY = RGBColor(15, 23, 42)       # Slate 900 / Deep Navy
    SECONDARY = RGBColor(2, 132, 199)    # Sky 600 / Vibrant Blue
    ACCENT = RGBColor(16, 185, 129)      # Emerald Green
    ACCENT_RED = RGBColor(225, 29, 72)   # Rose 600
    TEXT_DARK = RGBColor(30, 41, 59)     # Slate 800
    TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
    BG_LIGHT = RGBColor(248, 250, 252)   # Slate 50
    CARD_BG = RGBColor(255, 255, 255)    # Pure White
    BORDER_COLOR = RGBColor(226, 232, 240) # Slate 200

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="MAJOR PROJECT STAGE - I"):
        # Top banner accent line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.45), Inches(0.4), Inches(0.06))
        line.fill.solid()
        line.fill.fore_color.rgb = SECONDARY
        line.line.color.rgb = SECONDARY

        # Category text
        cat_box = slide.shapes.add_textbox(Inches(1.3), Inches(0.35), Inches(10), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = SECONDARY
        p_cat.font.name = "Arial"

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.75), Inches(0.65), Inches(11.8), Inches(0.65))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = PRIMARY
        p.font.name = "Arial"

        # Footer
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.3))
        tff = footer_box.text_frame
        pf = tff.paragraphs[0]
        pf.text = "Match&Map with me — Travel Companion Matching & Safety Platform | Dept. of CSE, RITW"
        pf.font.size = Pt(8.5)
        pf.font.color.rgb = TEXT_MUTED
        pf.font.name = "Arial"

    def add_card(slide, left, top, width, height, title=None, bg_color=CARD_BG, border_color=BORDER_COLOR):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        
        if title:
            tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.15), Inches(width - 0.4), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = SECONDARY
            p.font.name = "Arial"
        return shape

    # ==================== SLIDE 1: TITLE SLIDE ====================
    slide1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide1, PRIMARY)

    # Decorative header element
    dec = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.8), Inches(1.5), Inches(0.08))
    dec.fill.solid()
    dec.fill.fore_color.rgb = SECONDARY
    dec.line.color.rgb = SECONDARY

    # College info
    tb_inst = slide1.shapes.add_textbox(Inches(0.8), Inches(1.0), Inches(11.733), Inches(0.8))
    tf_inst = tb_inst.text_frame
    p_inst = tf_inst.paragraphs[0]
    p_inst.text = "Rishi M.S Institute of Engineering & Technology for Women"
    p_inst.font.size = Pt(13)
    p_inst.font.bold = True
    p_inst.font.color.rgb = RGBColor(147, 197, 253)
    p_inst.font.name = "Arial"
    
    p_dept = tf_inst.add_paragraph()
    p_dept.text = "Department of Computer Science and Engineering | IV B.Tech I-Sem (2023–2027)"
    p_dept.font.size = Pt(10.5)
    p_dept.font.color.rgb = RGBColor(203, 213, 225)
    p_dept.font.name = "Arial"

    # Main Project Title
    tb_title = slide1.shapes.add_textbox(Inches(0.8), Inches(2.0), Inches(11.733), Inches(1.8))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    pt = tf_t.paragraphs[0]
    pt.text = "Match&Map with me"
    pt.font.size = Pt(36)
    pt.font.bold = True
    pt.font.color.rgb = RGBColor(255, 255, 255)
    pt.font.name = "Arial"

    pt_sub = tf_t.add_paragraph()
    pt_sub.text = "Intelligent Travel Companion Matching & Integrated Safety Web Platform"
    pt_sub.font.size = Pt(18)
    pt_sub.font.bold = True
    pt_sub.font.color.rgb = RGBColor(56, 189, 248)
    pt_sub.font.name = "Arial"

    # Details Box (Card)
    card_title = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.2), Inches(11.733), Inches(2.4))
    card_title.fill.solid()
    card_title.fill.fore_color.rgb = RGBColor(30, 41, 59)
    card_title.line.color.rgb = RGBColor(51, 65, 85)

    tb_team = slide1.shapes.add_textbox(Inches(1.1), Inches(4.35), Inches(5.6), Inches(2.1))
    tf_team = tb_team.text_frame
    tf_team.word_wrap = True
    p1 = tf_team.paragraphs[0]
    p1.text = "PRESENTED BY (BATCH - 04):"
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(56, 189, 248)
    p1.font.name = "Arial"

    members = [
        ("B. Devi", "236P1A0515"),
        ("D. Lakshmi Sahasra", "236P1A0536"),
        ("A. Usha Tejaswi", "236P1A0508"),
        ("Afreen", "236P1A0504")
    ]
    for name, rno in members:
        pm = tf_team.add_paragraph()
        pm.text = f"•  {name} ({rno})"
        pm.font.size = Pt(10)
        pm.font.color.rgb = RGBColor(241, 245, 249)
        pm.font.name = "Arial"

    tb_guide = slide1.shapes.add_textbox(Inches(7.0), Inches(4.35), Inches(5.2), Inches(2.1))
    tf_guide = tb_guide.text_frame
    tf_guide.word_wrap = True
    pg = tf_guide.paragraphs[0]
    pg.text = "PROJECT GUIDE & COORDINATION:"
    pg.font.size = Pt(11)
    pg.font.bold = True
    pg.font.color.rgb = RGBColor(56, 189, 248)
    pg.font.name = "Arial"

    guides = [
        "Internal Guide: Ms. M. Tejaswini (Associate Professor)",
        "Project Coordinators: Dr. K. Ramakrishna & Ms. B. Bala Gowri",
        "Head of Department: Dr. Archana Patil",
        "Project Code: CS705PC | Academic Year: 2026-27"
    ]
    for g in guides:
        pm = tf_guide.add_paragraph()
        pm.text = f"•  {g}"
        pm.font.size = Pt(10)
        pm.font.color.rgb = RGBColor(241, 245, 249)
        pm.font.name = "Arial"


    # ==================== SLIDE 2: TABLE OF CONTENTS ====================
    slide2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide2, BG_LIGHT)
    add_header(slide2, "Table of Contents")

    # 2-column layout for TOC
    add_card(slide2, 0.8, 1.4, 5.7, 5.3, "Part I: Project Overview & Analysis")
    tb_toc1 = slide2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_toc1 = tb_toc1.text_frame
    tf_toc1.word_wrap = True
    toc_part1 = [
        "Abstract & Key Highlights",
        "1. Introduction",
        "2. Problem Statement",
        "3. Objectives of the Project",
        "4. Literature Survey",
        "5. Existing System & Limitations",
        "6. Proposed System & Innovations",
        "7. Requirements Analysis (FR & NFR)",
        "8. Software & Hardware Requirements",
        "9. System Architecture & High-Level Design"
    ]
    for i, item in enumerate(toc_part1):
        p = tf_toc1.paragraphs[0] if i == 0 else tf_toc1.add_paragraph()
        p.text = f"{item}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide2, 6.8, 1.4, 5.7, 5.3, "Part II: Technical Engineering & Results")
    tb_toc2 = slide2.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_toc2 = tb_toc2.text_frame
    tf_toc2.word_wrap = True
    toc_part2 = [
        "10. UML & DFD Diagrams (Use Case, Activity, Sequence, ER)",
        "11. Project Modules Description (Modules 1 to 4)",
        "12. Technologies & Tools Used (Full-Stack Stack)",
        "13. Implementation & Matching Algorithm Logic",
        "14. Testing Methodology (Unit, Integration, Security)",
        "15. Test Cases & Verification Results",
        "16. Screenshots & User Interface Walkthrough",
        "17. Conclusion & Future Scope",
        "18. Sustainable Development Goals (SDGs Alignment)",
        "19. References & Standards"
    ]
    for i, item in enumerate(toc_part2):
        p = tf_toc2.paragraphs[0] if i == 0 else tf_toc2.add_paragraph()
        p.text = f"{item}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 3: ABSTRACT ====================
    slide3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide3, BG_LIGHT)
    add_header(slide3, "Abstract")

    add_card(slide3, 0.8, 1.4, 11.733, 4.0, "Project Abstract")
    tb_abs = slide3.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(3.2))
    tf_abs = tb_abs.text_frame
    tf_abs.word_wrap = True
    
    p_abs1 = tf_abs.paragraphs[0]
    p_abs1.text = (
        "Match&Map with me is an intelligent full-stack web application designed to solve the challenges of solo travel "
        "and fragmented trip planning. It connects compatible travelers based on mutual destinations, travel dates, "
        "budget categories, travel styles, and shared interests using a dynamic multi-factor matchmaking algorithm."
    )
    p_abs1.font.size = Pt(13)
    p_abs1.font.color.rgb = TEXT_DARK
    p_abs1.font.name = "Arial"

    p_abs2 = tf_abs.add_paragraph()
    p_abs2.text = (
        "The platform seamlessly integrates Google Maps API for interactive route discovery, OpenWeather API for live "
        "meteorological forecasts, collaborative day-wise itinerary scheduling, eco-travel carbon footprint calculation, "
        "and real-time in-app group communication. Crucially, the platform features a comprehensive Emergency SOS "
        "system that captures live GPS coordinates, triggers an acoustic strobe alarm, and dispatches automated SMS "
        "alerts to designated emergency contacts, establishing a safe, economical, and socially connected travel ecosystem."
    )
    p_abs2.font.size = Pt(13)
    p_abs2.font.color.rgb = TEXT_DARK
    p_abs2.font.name = "Arial"

    # Keywords card
    add_card(slide3, 0.8, 5.6, 11.733, 1.1, "Keywords", CARD_BG)
    tb_kw = slide3.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.333), Inches(0.5))
    tf_kw = tb_kw.text_frame
    p_kw = tf_kw.paragraphs[0]
    p_kw.text = "Travel Companion Matching • Compatibility Scoring • Google Maps API • Emergency SOS Alert • GPS Tracking • React 19 • MongoDB • Full-Stack Web App"
    p_kw.font.size = Pt(11)
    p_kw.font.bold = True
    p_kw.font.color.rgb = SECONDARY
    p_kw.font.name = "Arial"


    # ==================== SLIDE 4: 1. INTRODUCTION ====================
    slide4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide4, BG_LIGHT)
    add_header(slide4, "1. Introduction")

    cards_intro = [
        ("Growing Solo Travel Trend", "Solo tourism has grown by over 42% globally, yet travelers frequently face loneliness, safety concerns, and inflated individual expenses for accommodation and transit.", 0.8, 1.4),
        ("The Need for Synergy", "Finding reliable, verified co-travelers with identical dates, compatible budgets, and similar exploration styles is currently uncoordinated and high-friction.", 6.8, 1.4),
        ("Integrated Travel Ecosystem", "Match&Map with me provides a unified hub uniting companion discovery, route visualization, weather intelligence, budget planning, and instant messaging.", 0.8, 4.2),
        ("Safety-First Engineering", "Empowers solo and female travelers with instant emergency SOS broadcasting, beneficiary contact notifications, and GPS geolocation telemetry.", 6.8, 4.2),
    ]

    for title, desc, l, t in cards_intro:
        add_card(slide4, l, t, 5.7, 2.5, title)
        tb = slide4.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 5: 2. PROBLEM STATEMENT ====================
    slide5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide5, BG_LIGHT)
    add_header(slide5, "2. Problem Statement")

    problems = [
        ("Fragmentation of Travel Tools", "Travelers juggle 4–6 disconnected apps for finding companions, checking routes, monitoring weather, chatting, and managing expense splits."),
        ("Lack of Compatibility Matching", "Online forums (Reddit, Facebook groups) rely on random unstructured postings without personality, language, or budget compatibility scoring."),
        ("Safety & Trust Vulnerabilities", "Solo travelers, particularly women and first-time tourists, lack verified safety networks, emergency SOS panic buttons, and GPS dispatch protocols."),
        ("High Cost Burden of Solo Travel", "Single room supplements and private transit pricing make solo trips 35–50% more expensive than collaborative group travel.")
    ]

    for i, (title, desc) in enumerate(problems):
        y = 1.4 + i * 1.3
        add_card(slide5, 0.8, y, 11.733, 1.15, f"Challenge {i+1}: {title}")
        tb = slide5.shapes.add_textbox(Inches(1.0), Inches(y + 0.45), Inches(11.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 6: 3. OBJECTIVES OF THE PROJECT ====================
    slide6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide6, BG_LIGHT)
    add_header(slide6, "3. Objectives of the Project")

    objs = [
        ("Intelligent Matchmaking", "Develop a weighted multi-attribute compatibility algorithm scoring users from 0% to 100% on budget, style, languages, and hobbies."),
        ("Centralized Itinerary & Maps", "Integrate interactive Google Maps route planning with day-wise activity scheduling and live OpenWeather destination insights."),
        ("Safety & SOS Protocol", "Design an instant Emergency SOS triggering an audio siren, strobe visualizer, and automated SMS with live GPS coordinates to guardians."),
        ("Eco-Awareness & Chat", "Incorporate real-time group chat communication and carbon footprint emission estimation to foster eco-conscious travel habits.")
    ]

    for i, (title, desc) in enumerate(objs):
        x = 0.8 if i % 2 == 0 else 6.8
        y = 1.4 if i < 2 else 4.2
        add_card(slide6, x, y, 5.7, 2.5, f"Objective {i+1}: {title}")
        tb = slide6.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 7: 4. LITERATURE SURVEY ====================
    slide7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide7, BG_LIGHT)
    add_header(slide7, "4. Literature Survey")

    # Table layout
    rows = 5
    cols = 4
    top = Inches(1.4)
    left = Inches(0.8)
    width = Inches(11.733)
    height = Inches(5.2)

    table_shape = slide7.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    # Column widths
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(2.8)
    table.columns[2].width = Inches(3.4)
    table.columns[3].width = Inches(3.333)

    headers = ["Paper / Platform", "Domain / Approach", "Key Findings / Contributions", "Identified Research Gaps"]
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.font.name = "Arial"

    lit_data = [
        ("Tinder / Bumble for Travel (2021)", "Swipe-based social matching for tourism", "High engagement via binary swipe UI; quick profile browsing", "Shallow matching without budget, trip dates, or emergency safety protocols"),
        ("TripIt & Wanderlog (2023)", "Itinerary planning & trip scheduling", "Comprehensive day-wise planning & booking confirmation sync", "Purely solo/family tools; no companion matching or emergency SOS distress beacon"),
        ("IEEE Survey on RecSys in Tourism (2022)", "Collaborative filtering & content-based recs", "Proves multi-factor weighting improves user satisfaction in travel buddies", "Lacks real-time interactive mapping, GPS telemetry dispatch, and carbon scoring"),
        ("Proposed: Match&Map with me (2026)", "Hybrid Multi-Factor Matchmaking + Safety", "Combines 0-100% compatibility algorithm, live maps, weather, chat & emergency SOS", "Holistic solution resolving fragmented tooling and solo travel vulnerabilities")
    ]

    for r, row in enumerate(lit_data):
        for c, val in enumerate(row):
            cell = table.cell(r + 1, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if r % 2 == 0 else RGBColor(241, 245, 249)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_DARK
            p.font.name = "Arial"


    # ==================== SLIDE 8: 5. EXISTING SYSTEM ====================
    slide8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide8, BG_LIGHT)
    add_header(slide8, "5. Existing System & Limitations")

    add_card(slide8, 0.8, 1.4, 5.7, 5.3, "Existing Workflow & Ecosystem")
    tb_ex = slide8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_ex = tb_ex.text_frame
    tf_ex.word_wrap = True
    ex_points = [
        "Unstructured Forums: Solo travelers rely on Reddit (r/travelpartners), Facebook Groups, or WhatsApp communities.",
        "Manual Coordination: Requires endless direct messaging to check mutual destinations, dates, and budgets.",
        "Disjointed Toolchain: Uses Google Maps for directions, WhatsApp for chat, Excel for itinerary, and Weather.com separately.",
        "Zero Compatibility Metric: High mismatch risk in personality, spending habits, and travel paces.",
        "No Safety Infrastructure: Absence of emergency distress signaling or beneficiary SOS alerts."
    ]
    for i, pt_txt in enumerate(ex_points):
        p = tf_ex.paragraphs[0] if i == 0 else tf_ex.add_paragraph()
        p.text = f"•  {pt_txt}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide8, 6.8, 1.4, 5.7, 5.3, "Critical Disadvantages & Pain Points")
    tb_dis = slide8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_dis = tb_dis.text_frame
    tf_dis.word_wrap = True
    dis_points = [
        "High Safety Risks: No real-time GPS telemetry, verified badges, or one-touch emergency panic sirens.",
        "High Abandonment Rate: 60%+ planned partner trips fail during discussions due to budget & itinerary mismatches.",
        "Inefficient Manual Effort: Users waste hours filtering posts without automated scoring or tag matching.",
        "Privacy Leaks: Sharing personal phone numbers on public social media forums before establishing trust.",
        "Lack of Eco-Consciousness: No visibility into travel mode environmental impacts."
    ]
    for i, pt_txt in enumerate(dis_points):
        p = tf_dis.paragraphs[0] if i == 0 else tf_dis.add_paragraph()
        p.text = f"❌  {pt_txt}"
        p.font.size = Pt(11)
        p.font.color.rgb = ACCENT_RED
        p.font.name = "Arial"


    # ==================== SLIDE 9: 6. PROPOSED SYSTEM ====================
    slide9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide9, BG_LIGHT)
    add_header(slide9, "6. Proposed System & Key Innovations")

    prop_cards = [
        ("Smart Multi-Factor Match Engine", "Dynamically evaluates interest overlap (25 pts), budget alignment (12 pts), travel style (12 pts), language (6 pts), and hobbies (5 pts) to generate 0–100% match scores.", 0.8, 1.4),
        ("Integrated Navigation & Weather", "Embedded interactive Google Maps with route visualization alongside live OpenWeather 5-day forecasts and clothing suggestions.", 6.8, 1.4),
        ("Emergency SOS & GPS Telemetry", "One-click panic button activating dual audio siren/strobe beacon and instant automated SMS dispatch containing live GPS coordinates to emergency contacts.", 0.8, 4.2),
        ("Eco-Scoring & In-App Chat", "Built-in real-time group and direct chat channels with carbon footprint metrics estimating CO2 savings per companion joined.", 6.8, 4.2)
    ]

    for title, desc, l, t in prop_cards:
        add_card(slide9, l, t, 5.7, 2.5, title)
        tb = slide9.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 10: 7. REQUIREMENTS ANALYSIS ====================
    slide10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide10, BG_LIGHT)
    add_header(slide10, "7. Requirements Analysis")

    add_card(slide10, 0.8, 1.4, 5.7, 5.3, "Functional Requirements (FR)")
    tb_fr = slide10.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_fr = tb_fr.text_frame
    tf_fr.word_wrap = True
    frs = [
        "FR1 (Auth): User registration, JWT login, and profile preference management.",
        "FR2 (Trip Management): Create, edit, publish, and search trips with budgets and dates.",
        "FR3 (Matching Engine): Compute compatibility percentage between any two users.",
        "FR4 (Join Requests): Send, accept, or decline companion join requests.",
        "FR5 (Live Chat): Send & receive instant messages within trip rooms.",
        "FR6 (Emergency SOS): Capture GPS coordinates and trigger distress alert dispatch."
    ]
    for i, item in enumerate(frs):
        p = tf_fr.paragraphs[0] if i == 0 else tf_fr.add_paragraph()
        p.text = f"✔ {item}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide10, 6.8, 1.4, 5.7, 5.3, "Non-Functional Requirements (NFR)")
    tb_nfr = slide10.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_nfr = tb_nfr.text_frame
    tf_nfr.word_wrap = True
    nfrs = [
        "NFR1 (Performance): Sub-200ms response time for compatibility score calculations.",
        "NFR2 (Security): Bcrypt password hashing, JWT token authentication, and sanitization.",
        "NFR3 (Reliability): 99.9% uptime for Emergency SOS and database services.",
        "NFR4 (Usability): Responsive mobile-first interface adhering to WCAG 2.1 accessibility.",
        "NFR5 (Scalability): Stateless RESTful API architecture ready for horizontal scaling.",
        "NFR6 (Maintainability): Modular component-driven TypeScript code structure."
    ]
    for i, item in enumerate(nfrs):
        p = tf_nfr.paragraphs[0] if i == 0 else tf_nfr.add_paragraph()
        p.text = f"⚡ {item}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 11: 8. SOFTWARE & HARDWARE REQUIREMENTS ====================
    slide11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide11, BG_LIGHT)
    add_header(slide11, "8. Software & Hardware Requirements")

    add_card(slide11, 0.8, 1.4, 5.7, 5.3, "Software Specifications")
    tb_sw = slide11.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_sw = tb_sw.text_frame
    tf_sw.word_wrap = True
    sw_list = [
        ("Operating System", "Windows 10 / 11, Linux, macOS"),
        ("Development IDE", "Visual Studio Code / Antigravity IDE"),
        ("Frontend Framework", "React 19, TypeScript, Vite 8"),
        ("Styling Framework", "Tailwind CSS v4 (Modern Design System)"),
        ("Backend Server", "Node.js (v20+), Express.js REST API"),
        ("Database Engine", "MongoDB (v7.0+) / MongoDB Atlas"),
        ("External APIs", "Google Maps JavaScript API, OpenWeather API"),
        ("Email / SMS Service", "Nodemailer (SMTP) / Twilio SMS API Gateway")
    ]
    for i, (k, v) in enumerate(sw_list):
        p = tf_sw.paragraphs[0] if i == 0 else tf_sw.add_paragraph()
        p.text = f"•  {k}: {v}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide11, 6.8, 1.4, 5.7, 5.3, "Hardware Specifications")
    tb_hw = slide11.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_hw = tb_hw.text_frame
    tf_hw.word_wrap = True
    hw_list = [
        ("Processor", "Intel Core i3 / AMD Ryzen 3 or above (1.30 GHz+)"),
        ("System Memory (RAM)", "4 GB minimum (8 GB recommended)"),
        ("Storage Capacity", "128 GB SSD / HDD or higher"),
        ("Display Resolution", "1366 x 768 or Full HD (1920 x 1080)"),
        ("Network Connectivity", "Broadband / Wi-Fi active Internet connection"),
        ("Client Devices", "Desktop PC, Laptop, Tablet, or Smartphone (HTML5)"),
        ("Sensors / Hardware", "GPS Geolocation receiver (Browser API / Mobile)")
    ]
    for i, (k, v) in enumerate(hw_list):
        p = tf_hw.paragraphs[0] if i == 0 else tf_hw.add_paragraph()
        p.text = f"•  {k}: {v}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 12: 9. SYSTEM ARCHITECTURE & DESIGN ====================
    slide12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide12, BG_LIGHT)
    add_header(slide12, "9. System Architecture & Design")

    # 3-Tier Architecture Cards explicitly featuring Recommendation, Itinerary, and Map
    tiers = [
        ("Presentation Tier (React 19 + Vite)", "• Dashboard & Active Trips Feed\n• Interactive Map & Route Viewer\n• AI Companion Recommendation Feed\n• Day-Wise Itinerary Scheduler UI\n• Real-Time Group & Private Chat\n• Emergency SOS Beacon & Reviews", 0.8, 1.4, 3.6),
        ("Backend Services (Node / Express)", "• REST API Gateway & JWT Auth\n• Companion Recommendation Engine (0-100% Score)\n• Day-Wise Itinerary & Activity Service\n• Interactive Map & Route Navigation Engine\n• Live Weather & Eco-Carbon Planner\n• Real-Time Chat & Emergency SOS Service", 4.8, 1.4, 3.7),
        ("Database & External Cloud Tier", "• MongoDB Database\n  (Users, Trips, Itineraries, Chats, SOS, Reviews)\n• Google Maps & Places Platform API\n  (Live Geocoding, Waypoints & Directions)\n• OpenWeatherMap REST API (5-Day Forecasts)\n• Emergency SOS SMS Alert Gateway", 8.9, 1.4, 3.633)
    ]

    for title, desc, l, t, w in tiers:
        add_card(slide12, l, t, w, 5.3, title)
        tb = slide12.shapes.add_textbox(Inches(l + 0.15), Inches(t + 0.65), Inches(w - 0.3), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 13: 10. UML & DFD DIAGRAMS ====================
    slide13 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide13, BG_LIGHT)
    add_header(slide13, "10. UML & DFD Diagrams")

    diagrams = [
        ("Use Case Diagram", "Actors: Traveler, Companion, Admin.\nUse Cases: Register, Search Trips, Calculate Match Score, Send Request, Chat, Trigger SOS, Manage Reports."),
        ("Sequence Diagram", "User initiates Trip Match -> Express sends candidate pool -> Match Engine computes score -> Returns sorted profiles -> User dispatches Join Request."),
        ("Activity Diagram", "Start -> Enter Preferences -> Algorithm weights attributes -> Display Companion Cards -> Select Partner -> Real-time Chat -> Trip Finalized."),
        ("DFD Level 0 & Level 1", "Level 0: Traveler <-> [Match&Map System] <-> Database & APIs.\nLevel 1: 1.0 Auth -> 2.0 Trip CRUD -> 3.0 Compatibility RecSys -> 4.0 SOS Alert.")
    ]

    for i, (title, desc) in enumerate(diagrams):
        x = 0.8 if i % 2 == 0 else 6.8
        y = 1.4 if i < 2 else 4.2
        add_card(slide13, x, y, 5.7, 2.5, title)
        tb = slide13.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 14: 11. PROJECT MODULES DESCRIPTION ====================
    slide14 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide14, BG_LIGHT)
    add_header(slide14, "11. Project Modules Description")

    modules = [
        ("Module 1: Auth & Profile Management", "• JWT Token-based secure authentication\n• Multi-attribute profile (budget, languages, hobbies)\n• Beneficiary emergency contact registration\n• Verified traveler trust badge management"),
        ("Module 2: Trip & Itinerary Management", "• Trip creation with destination, dates & budget tags\n• Day-wise activity and timeline scheduling\n• Interactive Google Maps route & waypoint display\n• Live OpenWeather destination forecasts"),
        ("Module 3: Companion Matchmaking", "• 0–100% dynamic multi-factor compatibility algorithm\n• Smart filters by destination, date range & budget\n• Join request workflow (Pending / Accepted / Declined)\n• Companion recommendations & profile discovery"),
        ("Module 4: Navigation, Chat & Emergency SOS", "• Real-time trip group & direct messaging\n• One-click Emergency SOS distress trigger\n• High-decibel audio siren & visual strobe flasher\n• Live GPS geolocation SMS dispatch to guardians")
    ]

    for i, (title, desc) in enumerate(modules):
        x = 0.8 if i % 2 == 0 else 6.8
        y = 1.4 if i < 2 else 4.2
        add_card(slide14, x, y, 5.7, 2.5, title)
        tb = slide14.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 15: 12. TECHNOLOGIES & TOOLS USED ====================
    slide15 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide15, BG_LIGHT)
    add_header(slide15, "12. Technologies & Tools Used")

    tech_stack = [
        ("Frontend Technologies", "• React 19 & TypeScript\n• Vite 8 (Ultra-fast HMR)\n• Tailwind CSS v4 (Glassmorphism & tokens)\n• Lucide React Icons & Web Audio API", 0.8, 1.4),
        ("Backend Technologies", "• Node.js 20+ Runtime\n• Express.js REST Framework\n• JSON Web Token (JWT) & Bcryptjs\n• Nodemailer & Geolocation Services", 6.8, 1.4),
        ("Database & Storage", "• MongoDB NoSQL Document Database\n• Mongoose ODM (Schema validation & indexing)\n• MongoDB Atlas Cloud Cluster\n• LocalStorage Client Token Persistence", 0.8, 4.2),
        ("APIs & Development Tools", "• Google Maps Platform APIs\n• OpenWeatherMap REST API\n• Git, GitHub & Postman for API Testing\n• VS Code & Chrome DevTools MCP", 6.8, 4.2)
    ]

    for title, desc, l, t in tech_stack:
        add_card(slide15, l, t, 5.7, 2.5, title)
        tb = slide15.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 16: 13. IMPLEMENTATION & ALGORITHMS ====================
    slide16 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide16, BG_LIGHT)
    add_header(slide16, "13. Implementation & Matching Algorithm")

    add_card(slide16, 0.8, 1.4, 5.7, 5.3, "Matching Compatibility Formula")
    tb_algo = slide16.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_algo = tb_algo.text_frame
    tf_algo.word_wrap = True
    algo_steps = [
        "Baseline Score: Initialized at 50 pts.",
        "1. Interest Overlap (Up to +25 pts):\n   Ratio = |Interests_curr ∩ Interests_cand| / min(|Interests|, 5)\n   Bonus = round(Ratio * 25)",
        "2. Budget Alignment (Up to +12 pts):\n   Exact match: +12 pts | Adjacent tier: +6 pts",
        "3. Travel Style Match (Up to +12 pts):\n   Exact style match: +12 pts | Distinct: +5 pts",
        "4. Spoken Language Overlap (Up to +6 pts):\n   +3 pts per shared language (Max +6 pts)",
        "5. Shared Hobbies (Up to +5 pts):\n   +2 pts per shared hobby (Max +5 pts)",
        "Score Clamped: Bounds restricted between 55% and 99%."
    ]
    for i, st in enumerate(algo_steps):
        p = tf_algo.paragraphs[0] if i == 0 else tf_algo.add_paragraph()
        p.text = st
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide16, 6.8, 1.4, 5.7, 5.3, "Emergency SOS & Geolocation Implementation")
    tb_sos = slide16.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_sos = tb_sos.text_frame
    tf_sos.word_wrap = True
    sos_steps = [
        "1. Trigger Activation: User taps 'Emergency SOS' button from navigation bar or floating panic widget.",
        "2. Web Audio Oscillator: Browser Synthesizer initializes a high-pitch 850Hz-1200Hz pulsing distress siren.",
        "3. Screen Strobe Beacon: Screen flashes high-frequency red/white visual beacon for nighttime rescue visibility.",
        "4. GPS Telemetry Capture: navigator.geolocation fetches latitude, longitude, altitude, and precision radius.",
        "5. Automated SMS Broadcast: Server triggers SMS payload to registered emergency beneficiary with Google Maps coordinates link.",
        "6. Audit Logging: SOS event timestamp and location stored securely in MongoDB for emergency services review."
    ]
    for i, st in enumerate(sos_steps):
        p = tf_sos.paragraphs[0] if i == 0 else tf_sos.add_paragraph()
        p.text = st
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 17: 14. TESTING METHODOLOGY ====================
    slide17 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide17, BG_LIGHT)
    add_header(slide17, "14. Testing Methodology")

    testing_cards = [
        ("Unit Testing", "Tested individual modules including calculateCompatibility() score math, JWT token generation, password hash verification, and route parameter validation.", 0.8, 1.4),
        ("Integration Testing", "Verified end-to-end data pipeline between React frontend hooks, Express controller endpoints, Mongoose schema models, and MongoDB database queries.", 6.8, 1.4),
        ("Black-Box / UI Testing", "Conducted comprehensive functional user workflow tests: user signup, trip creation, buddy request sending, chat messaging, and SOS alert dismissal.", 0.8, 4.2),
        ("Security & API Testing", "Tested unauthorized route access (401/403 status codes), SQL/NoSQL injection vulnerability protection, CORS validation, and API error handling.", 6.8, 4.2)
    ]

    for title, desc, l, t in testing_cards:
        add_card(slide17, l, t, 5.7, 2.5, title)
        tb = slide17.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 18: 15. TEST CASES & RESULTS ====================
    slide18 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide18, BG_LIGHT)
    add_header(slide18, "15. Test Cases & Verification Results")

    # Table layout
    rows = 6
    cols = 5
    top = Inches(1.4)
    left = Inches(0.8)
    width = Inches(11.733)
    height = Inches(5.2)

    table_shape2 = slide18.shapes.add_table(rows, cols, left, top, width, height)
    t2 = table_shape2.table

    t2.columns[0].width = Inches(1.2)
    t2.columns[1].width = Inches(2.3)
    t2.columns[2].width = Inches(3.2)
    t2.columns[3].width = Inches(3.6)
    t2.columns[4].width = Inches(1.433)

    h2 = ["Test ID", "Module Tested", "Input / Condition", "Expected Output", "Status"]
    for c, h in enumerate(h2):
        cell = t2.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.font.name = "Arial"

    tc_data = [
        ("TC-01", "User Authentication", "Valid email & password entered", "JWT token generated; redirected to dashboard", "PASSED"),
        ("TC-02", "Trip Creation", "Valid destination, dates & budget", "Trip saved in MongoDB & rendered in feed", "PASSED"),
        ("TC-03", "Match Engine", "Users with 3 common interests & budget", "Calculates compatibility score (e.g. 92%)", "PASSED"),
        ("TC-04", "In-App Chat", "Send text message in trip room", "Message appended in real-time to active room", "PASSED"),
        ("TC-05", "Emergency SOS", "Click SOS panic trigger button", "Audio siren starts, GPS sent, SMS broadcast", "PASSED")
    ]

    for r, row in enumerate(tc_data):
        for c, val in enumerate(row):
            cell = t2.cell(r + 1, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if r % 2 == 0 else RGBColor(241, 245, 249)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9.5)
            if c == 4:
                p.font.bold = True
                p.font.color.rgb = ACCENT
            else:
                p.font.color.rgb = TEXT_DARK
            p.font.name = "Arial"


    # ==================== SLIDE 19: 16. SCREENSHOTS & UI WALKTHROUGH ====================
    slide19 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide19, BG_LIGHT)
    add_header(slide19, "16. Screenshots of Implementation")

    screens = [
        ("1. Discover Trips & Search Feed", "Displays published trip cards with destination badges, travel dates, budget tags, host profiles, and match compatibility percentages.", 0.8, 1.4),
        ("2. Trip Detail & Interactive Route Map", "Full trip itinerary view with embedded Google Maps directions, day-by-day activity timelines, and live OpenWeather widget.", 6.8, 1.4),
        ("3. Companion Matching & Profile Cards", "Dynamic buddy recommendation feed showing compatibility match %, shared interests, hobbies, languages, and 'Send Request' button.", 0.8, 4.2),
        ("4. Emergency SOS Siren & Strobe Beacon", "High-visibility emergency panic screen displaying live GPS coordinates, contact dispatch telemetry, acoustic siren toggles, and safe cancel PIN.", 6.8, 4.2)
    ]

    for title, desc, l, t in screens:
        add_card(slide19, l, t, 5.7, 2.5, title)
        tb = slide19.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 20: 17. CONCLUSION & FUTURE SCOPE ====================
    slide20 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide20, BG_LIGHT)
    add_header(slide20, "17. Conclusion & Future Scope")

    add_card(slide20, 0.8, 1.4, 5.7, 5.3, "Conclusion")
    tb_c = slide20.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    c_pts = [
        "Holistic Platform: Successfully engineered a unified full-stack solution eliminating the fragmentation of modern solo travel.",
        "Precision Matchmaking: Multi-factor algorithm effectively connects compatible buddies, reducing trip cancellations.",
        "Safety Transformation: Emergency SOS siren, strobe visualizer, and GPS SMS dispatch make solo travel significantly safer.",
        "Eco-Conscious Travel: Carbon footprint tracking encourages shared transit and environmentally responsible tourism.",
        "Robust Architecture: Built on scalable modern web technologies (React 19, Node.js, Express, MongoDB)."
    ]
    for i, item in enumerate(c_pts):
        p = tf_c.paragraphs[0] if i == 0 else tf_c.add_paragraph()
        p.text = f"✔  {item}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"

    add_card(slide20, 6.8, 1.4, 5.7, 5.3, "Future Scope & Enhancements")
    tb_fs = slide20.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_fs = tb_fs.text_frame
    tf_fs.word_wrap = True
    fs_pts = [
        "AI-Powered Itinerary Generator: Integrate LLM agents (Gemini API) to auto-generate personalized day-wise itineraries.",
        "Smart Wearable Integration: Connect Apple Watch / WearOS devices for automatic fall detection and heart-rate anomaly SOS triggers.",
        "Decentralized Identity Verification: Implement Govt ID KYC verification and cryptographic trust badges.",
        "Automated Expense Splitter: In-app split-billing wallet supporting multi-currency group payments and settlement.",
        "Offline Map Caching: Progressive Web App (PWA) offline navigation support for remote wilderness expeditions."
    ]
    for i, item in enumerate(fs_pts):
        p = tf_fs.paragraphs[0] if i == 0 else tf_fs.add_paragraph()
        p.text = f"🚀  {item}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = SECONDARY
        p.font.name = "Arial"


    # ==================== SLIDE 21: 18. SUSTAINABLE DEVELOPMENT GOALS ====================
    slide21 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide21, BG_LIGHT)
    add_header(slide21, "18. Sustainable Development Goals (SDGs)")

    sdgs = [
        ("SDG 3: Good Health and Well-Being", "Promotes mental wellness and reduces solo travel anxiety through social companion matching, while the Emergency SOS distress beacon safeguards physical security."),
        ("SDG 8: Decent Work & Economic Growth", "Fosters sustainable local tourism economies and micro-hospitality businesses by connecting travelers directly with community experiences."),
        ("SDG 11: Sustainable Cities & Communities", "Encourages carpooling, shared group transit, and reduced single-occupancy vehicle travel in high-density tourist destinations."),
        ("SDG 12 & 13: Responsible Consumption & Climate Action", "Calculates trip carbon emissions and incentives eco-friendly itinerary choices, reducing aggregate carbon footprints.")
    ]

    for i, (title, desc) in enumerate(sdgs):
        x = 0.8 if i % 2 == 0 else 6.8
        y = 1.4 if i < 2 else 4.2
        add_card(slide21, x, y, 5.7, 2.5, title)
        tb = slide21.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.65), Inches(5.3), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 22: 19. REFERENCES ====================
    slide22 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide22, BG_LIGHT)
    add_header(slide22, "19. References")

    add_card(slide22, 0.8, 1.4, 11.733, 5.3, "Academic & Technical References")
    tb_ref = slide22.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.5))
    tf_ref = tb_ref.text_frame
    tf_ref.word_wrap = True
    refs = [
        "[1] World Tourism Organization (UNWTO), 'Global Report on Solo Travel Trends and Modern Traveler Demographics', Madrid, 2023.",
        "[2] F. Ricci, L. Rokach, and B. Shapira, 'Recommender Systems Handbook: Tourism Applications and User Profiling', Springer, 2022.",
        "[3] J. Zhang, 'Multi-Factor Recommendation Algorithms in Collaborative Travel Systems', IEEE Access, vol. 10, pp. 45120-45132, 2022.",
        "[4] Google Maps Platform Documentation, 'Directions API and Geocoding API Developers Reference Guide', Google Cloud, 2025.",
        "[5] OpenWeatherMap Ltd., 'Weather Forecasting & Meteorological REST API Specifications', Version 3.0, 2025.",
        "[6] React Documentation & Community Guidelines, 'React 19 Concurrent Architecture and Server Components', 2025.",
        "[7] MongoDB Inc., 'MongoDB Manual: Document Schema Design and Geospatial Query Indexing', MongoDB Press, 2024.",
        "[8] United Nations, 'The 17 Sustainable Development Goals (SDGs) for 2030 Agenda', Department of Economic and Social Affairs, 2023."
    ]
    for i, ref in enumerate(refs):
        p = tf_ref.paragraphs[0] if i == 0 else tf_ref.add_paragraph()
        p.text = ref
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_DARK
        p.font.name = "Arial"


    # ==================== SLIDE 23: THANK YOU SLIDE ====================
    slide23 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide23, PRIMARY)

    tb_ty = slide23.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.733), Inches(2.5))
    tf_ty = tb_ty.text_frame
    tf_ty.word_wrap = True
    
    pty = tf_ty.paragraphs[0]
    pty.text = "Thank You!"
    pty.font.size = Pt(44)
    pty.font.bold = True
    pty.font.color.rgb = RGBColor(255, 255, 255)
    pty.font.name = "Arial"
    pty.alignment = PP_ALIGN.CENTER

    pty_sub = tf_ty.add_paragraph()
    pty_sub.text = "Questions & Answers / Demonstration Session"
    pty_sub.font.size = Pt(20)
    pty_sub.font.color.rgb = RGBColor(56, 189, 248)
    pty_sub.font.name = "Arial"
    pty_sub.alignment = PP_ALIGN.CENTER

    tb_cont = slide23.shapes.add_textbox(Inches(0.8), Inches(4.8), Inches(11.733), Inches(1.5))
    tf_cont = tb_cont.text_frame
    tf_cont.word_wrap = True
    p_c = tf_cont.paragraphs[0]
    p_c.text = "Match&Map with me — Travel Companion Matching & Safety Platform\nDepartment of Computer Science and Engineering\nRishi M.S Institute of Engineering & Technology for Women"
    p_c.font.size = Pt(13)
    p_c.font.color.rgb = RGBColor(203, 213, 225)
    p_c.font.name = "Arial"
    p_c.alignment = PP_ALIGN.CENTER

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MatchAndMap_Presentation_Updated.pptx")
    prs.save(output_path)
    print("Presentation successfully created at MatchAndMap_Presentation_Updated.pptx!")

if __name__ == "__main__":
    create_deck()
