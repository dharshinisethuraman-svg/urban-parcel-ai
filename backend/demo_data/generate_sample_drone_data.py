import os
import cv2
import numpy as np

def generate_realistic_drone_orthomosaic(output_path: str, width: int = 1400, height: int = 1050):
    """
    Synthesizes a realistic high-resolution urban aerial drone survey image
    featuring distinct cadastral parcels, buildings with diverse rooftops,
    roads, and vegetation textures for testing and demonstration.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 1. Base terrain: Subtle textured urban ground / grass / soil
    np.random.seed(42)
    # Light earthy green base
    base = np.zeros((height, width, 3), dtype=np.uint8)
    base[:, :] = [75, 125, 95]  # BGR greenish grass/ground

    # Add perlin-like noise texture
    noise = np.random.randint(-15, 15, (height, width, 3), dtype=np.int16)
    base = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # 2. Road Network
    # Primary east-west road
    road_y = 480
    road_h = 100
    cv2.rectangle(base, (0, road_y), (width, road_y + road_h), (55, 55, 58), -1)
    
    # North-south connector road
    road_x = 650
    road_w = 90
    cv2.rectangle(base, (road_x, 0), (road_x + road_w, height), (55, 55, 58), -1)

    # Road curbs (concrete grey edges)
    cv2.line(base, (0, road_y), (width, road_y), (140, 140, 140), 3)
    cv2.line(base, (0, road_y + road_h), (width, road_y + road_h), (140, 140, 140), 3)
    cv2.line(base, (road_x, 0), (road_x, height), (140, 140, 140), 3)
    cv2.line(base, (road_x + road_w, 0), (road_x + road_w, height), (140, 140, 140), 3)

    # Road center dashed line (white markings)
    for x in range(10, width, 40):
        if not (road_x - 10 <= x <= road_x + road_w + 10):
            cv2.line(base, (x, road_y + road_h // 2), (x + 20, road_y + road_h // 2), (230, 230, 230), 2)
    for y in range(10, height, 40):
        if not (road_y - 10 <= y <= road_y + road_h + 10):
            cv2.line(base, (road_x + road_w // 2, y), (road_x + road_w // 2, y + 20), (230, 230, 230), 2)

    # 3. Cadastral Parcel Boundaries & Plots
    # We define 8 distinct parcels around the intersection
    parcel_boxes = [
        # Top-Left quadrant parcels
        (50, 50, 320, 420),
        (340, 50, 630, 420),
        # Top-Right quadrant parcels
        (760, 50, 1050, 420),
        (1070, 50, 1350, 420),
        # Bottom-Left quadrant parcels
        (50, 600, 320, 1000),
        (340, 600, 630, 1000),
        # Bottom-Right quadrant parcels
        (760, 600, 1050, 1000),
        (1070, 600, 1350, 1000),
    ]

    for (x1, y1, x2, y2) in parcel_boxes:
        # Parcel turf / surface color variation
        tints = [
            (70, 115, 85),   # darker grass
            (85, 140, 105),  # light lawn
            (80, 120, 110),  # paved lawn
            (95, 125, 120)   # garden patch
        ]
        plot_tint = tints[np.random.randint(0, len(tints))]
        cv2.rectangle(base, (x1 + 4, y1 + 4), (x2 - 4, y2 - 4), plot_tint, -1)

        # Compound wall / boundary fence (stone/white fence)
        cv2.rectangle(base, (x1, y1), (x2, y2), (210, 215, 210), 3)

        # Driveway connection to road
        if y2 == 420:
            cv2.rectangle(base, (x1 + 30, y2 - 20), (x1 + 70, road_y), (110, 110, 115), -1)
        elif y1 == 600:
            cv2.rectangle(base, (x1 + 30, road_y + road_h), (x1 + 70, y1 + 20), (110, 110, 115), -1)

    # 4. Buildings inside Parcels
    building_specs = [
        # (x, y, w, h, roof_type, color)
        # Parcel 1
        (90, 100, 170, 140, "Terracotta Tile", (35, 75, 195)),
        # Parcel 2
        (380, 120, 190, 160, "Concrete Flat", (150, 155, 160)),
        # Parcel 3
        (800, 90, 180, 150, "Terracotta Tile", (40, 80, 205)),
        # Parcel 4
        (1110, 110, 190, 170, "Metal Blue Sheet", (180, 110, 50)),
        # Parcel 5
        (90, 670, 180, 150, "Concrete Flat", (160, 165, 170)),
        # Parcel 6
        (390, 690, 170, 160, "Terracotta Tile", (30, 70, 190)),
        # Parcel 7
        (810, 680, 180, 170, "Metal Blue Sheet", (175, 105, 45)),
        # Parcel 8
        (1120, 690, 180, 160, "Terracotta Tile", (35, 75, 200)),
    ]

    for (bx, by, bw, bh, btype, bcolor) in building_specs:
        # Building cast shadow (dark translucent rectangle offset to bottom-right)
        shadow_offset = 12
        cv2.rectangle(
            base,
            (bx + shadow_offset, by + shadow_offset),
            (bx + bw + shadow_offset, by + bh + shadow_offset),
            (25, 25, 25),
            -1
        )

        # Rooftop base
        cv2.rectangle(base, (bx, by), (bx + bw, by + bh), bcolor, -1)
        # Roof border outline
        cv2.rectangle(base, (bx, by), (bx + bw, by + bh), (40, 40, 40), 2)

        # Add roof detail: ridge lines or AC units
        if "Tile" in btype:
            # Roof ridge line
            cv2.line(base, (bx, by + bh // 2), (bx + bw, by + bh // 2), (20, 40, 140), 2)
            # Rake lines
            cv2.line(base, (bx, by), (bx + 30, by + bh // 2), (20, 40, 140), 2)
            cv2.line(base, (bx, by + bh), (bx + 30, by + bh // 2), (20, 40, 140), 2)
            cv2.line(base, (bx + bw, by), (bx + bw - 30, by + bh // 2), (20, 40, 140), 2)
            cv2.line(base, (bx + bw, by + bh), (bx + bw - 30, by + bh // 2), (20, 40, 140), 2)
        elif "Concrete" in btype:
            # Rooftop access structure and skylight
            cv2.rectangle(base, (bx + 20, by + 20), (bx + 60, by + 60), (120, 125, 130), -1)
            cv2.rectangle(base, (bx + 80, by + 30), (bx + 110, by + 50), (220, 220, 220), -1)

    # 5. Trees / Green foliage clusters around boundaries
    tree_centers = [
        (60, 400), (310, 400), (350, 400), (620, 400),
        (770, 400), (1040, 400), (1080, 400), (1330, 400),
        (60, 620), (310, 620), (350, 620), (620, 620),
        (770, 620), (1040, 620), (1080, 620), (1330, 620),
        (280, 80), (740, 250), (1030, 850), (1330, 80)
    ]

    for (tx, ty) in tree_centers:
        radius = np.random.randint(14, 24)
        # Tree shadow
        cv2.circle(base, (tx + 6, ty + 6), radius, (20, 25, 20), -1)
        # Tree crown
        tree_color = (np.random.randint(30, 50), np.random.randint(100, 145), np.random.randint(45, 75))
        cv2.circle(base, (tx, ty), radius, tree_color, -1)
        cv2.circle(base, (tx - 3, ty - 3), radius // 2, (tree_color[0]+15, tree_color[1]+20, tree_color[2]+15), -1)

    # Save final image
    cv2.imwrite(output_path, base, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print(f"[Sample Generator] Created demo drone orthomosaic: {output_path} ({width}x{height})")
    return output_path

if __name__ == "__main__":
    out1 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "sample_drone_orthomosaic.jpg")
    out2 = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "samples", "urban_drone_survey_sample.jpg")
    generate_realistic_drone_orthomosaic(out1)
    generate_realistic_drone_orthomosaic(out2)
