#!/usr/bin/env python3
import json

# Read the menu data
with open("menu-data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Arabic translations mapping
translations = {
    # Categories
    "Protein Shakes": "مخفوق البروتين",
    "Healthy Bowls": "أوعية صحية",
    "Chia & Oats Delights": "متع الشيا والشوفان",
    "Smoothies": "المشروبات الممزوجة",
    "Wellness Shots": "لقطات الصحة والعافية",
    "Fruits Cup": "كوب الفواكه",
    "Fresh Juices": "عصائر طازجة",
    
    # Toppings
    "Toppings": "الإضافات",
    "Extra Protein": "بروتين إضافي",
    "Honey": "عسل",
    "Granola": "جرانولا",
    "Mixed Nuts": "مكسرات مختلطة",
    "Shredded Coconut": "جوز هند مبشور",
    
    # Items
    "Blueberry Protein Bowl": "وعاء بروتين التوت الأزرق",
    "Acai Bowl": "وعاء أكاي",
    "Peanut Butter Delight Bowl": "وعاء متعة زبدة الفول السوداني",
    "Pink Oasis Bowl": "وعاء الواحة الوردية",
    "Tropical Heaven Bowl": "وعاء الجنة الاستوائية",
    "Green Dream Bowl": "وعاء الحلم الأخضر",
    "Golden Sunrise Bowl": "وعاء شروق الشمس الذهبي",
    "Chia Pudding with Mixed Fruit": "بودنج الشيا مع الفواكه المختلطة",
    "Banana Peanut Butter Chia Pudding": "بودنج الشيا بالموز وزبدة الفول السوداني",
    "Vanilla Protein Overnight Oats": "الشوفان بالفانيليا والبروتين",
    "Chocolate Protein Overnight Oats": "الشوفان الليلي بالشوكولاتة والبروتين",
    "Immune Booster": "معزز المناعة",
    "Strawberry Banana": "فراولة موز",
    "Mango Lassi": "لاسي المانجو",
    "Green Detox": "التخلص من السموم الأخضر",
    "Beets N Berries": "الشمندر والتوت",
    "Pink Power Protein": "قوة وردية بروتين",
    "Tropical Green Protein": "بروتين أخضر استوائي",
    "Morning Blend Protein": "خليط الصباح بروتين",
    "Peanut Butter Protein": "بروتين زبدة الفول السوداني",
    "Ginger Immunity Shot": "لقطة الزنجبيل للمناعة",
    "Turmeric Anti-Inflammatory": "الكركم المضاد للالتهابات",
    "Apple Cider Detox": "خل التفاح للتطهير",
    "Tropical Mix": "مزيج استوائي",
    "Berry Blend": "مزيج التوت",
    "Citrus Punch": "عصير الحمضيات",
    "Mixed Cup": "كوب مختلط",
    "Fresh Orange Juice": "عصير البرتقال الطازج",
    "Orange Juice": "عصير البرتقال",
    "Apple Juice": "عصير التفاح",
    "Mango Juice": "عصير المانجو",
    "Avocado Juice": "عصير الأفوكادو",
    "Fresh Carrot Juice": "عصير الجزرة الطازج",
    "Carrot Juice": "عصير الجزر",
    "Kiwi Juice": "عصير الكيوي",
    "Watermelon Juice": "عصير البطيخ",
    "Pineapple Juice": "عصير الأناناس",
    "Tender Coconut Juice": "عصير جوز الهند الطري",
    
    # Ingredients
    "Mixed berries": "التوت المختلط",
    "Yogurt": "زبادي",
    "Protein powder": "مسحوق بروتين",
    "Granola": "جرانولا",
    "Acai puree": "هريس أكاي",
    "Toppings": "إضافات",
    "Peanut butter": "زبدة الفول السوداني",
    "Banana": "موز",
    "Almond milk": "حليب اللوز",
    "Cocoa powder": "مسحوق الكاكاو",
    "Non-dairy creamer": "كريمة غير ألبانية",
    "Dragon fruit": "ثمرة التنين",
    "Pineapple": "أناناس",
    "Mango": "مانجو",
    "Strawberry": "فراولة",
    "Oat milk": "حليب الشوفان",
    "Coconut milk": "حليب جوز الهند",
    "Honey": "عسل",
    "Spirulina": "سبيرولينا",
    "Spinach": "سبانخ",
    "Avocado": "أفوكادو",
    "Chia pudding": "بودنج الشيا",
    "Mixed fruit": "فواكه مختلطة",
    "Overnight oats": "الشوفان الليلي",
    "Vanilla": "الفانيليا",
    "Protein": "بروتين",
    "Chocolate": "شوكولاتة",
    "Orange": "برتقال",
    "Carrot": "جزرة",
    "Peach": "خوخ",
    "Apple": "تفاح",
    "Ginger": "زنجبيل",
    "Lemon": "ليمون",
    "Raspberry": "توت العليق",
    "Beetroot": "شمندر",
    "Dates puree": "معجون التمر",
    "Apple juice": "عصير التفاح",
    "Dates": "تمر",
    "Cinnamon": "قرفة",
    "Turmeric": "كركم",
    "Black pepper": "فلفل أسود",
    "Coconut oil": "زيت جوز الهند",
    "Apple cider vinegar": "خل التفاح",
    "Water": "ماء",
    "Papaya": "باباي",
    "Coconut": "جوز الهند",
    "Blueberry": "توت أزرق",
    "Blackberry": "التوت الأسود",
    "Grapefruit": "جريب فروت",
    "Lime": "ليمون أخضر",
    "Fresh oranges": "برتقال طازج",
    "Fresh carrots": "جزر طازج",
    "Fresh watermelon": "بطيخ طازج",
    "Fresh pineapple": "أناناس طازج",
    "Mixed fruits": "فواكه مختلطة",
    "Kiwi": "كيوي",
    "Tender coconut": "جوز هند طري",
    "Cardamom": "هيل",
    
    # Micronutrients
    "Vit C": "فيتامين ج",
    "Antioxidants": "مضادات الأكسدة",
    "Potassium": "بوتاسيوم",
    "Magnesium": "ماغنسيوم",
    "Iron": "حديد",
    "Bromelain": "بروملين",
    "Vit B": "فيتامين ب",
    "Vit A": "فيتامين أ",
    "Vit K": "فيتامين ك",
    "Omega 3": "أوميجا 3",
    "Omega 6": "أوميجا 6",
    "Manganese": "منجنيز",
    "Vit E": "فيتامين ي",
    "Zinc": "زنك",
    "Calcium": "كالسيوم",
    "Folate": "حمض الفوليك",
    "Curcumin": "كركمين",
    "Enzymes": "الإنزيمات",
    "Lycopene": "ليكوبين",
}

# Update addon groups
for group in data.get("addon_groups", []):
    if group["name_en"] in translations:
        group["name_ar"] = translations[group["name_en"]]
    for addon in group.get("addons", []):
        if addon["name_en"] in translations:
            addon["name_ar"] = translations[addon["name_en"]]

# Update categories and items
for category in data.get("categories", []):
    if category["name_en"] in translations:
        category["name_ar"] = translations[category["name_en"]]
    
    for item in category.get("items", []):
        # Translate item name
        if item["name_en"] in translations:
            item["name_ar"] = translations[item["name_en"]]
        
        # Translate ingredients
        if "ingredients_en" in item and isinstance(item["ingredients_en"], list):
            item["ingredients_ar"] = [
                translations.get(ing, ing) for ing in item["ingredients_en"]
            ]
        
        # Translate micronutrients
        if "nutrition" in item and "micros_en" in item["nutrition"]:
            if isinstance(item["nutrition"]["micros_en"], list):
                item["nutrition"]["micros_ar"] = [
                    translations.get(micro, micro) for micro in item["nutrition"]["micros_en"]
                ]

# Write updated data
with open("menu-data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✓ Arabic translations added successfully!")
print(f"✓ Updated {len(data.get('categories', []))} categories")
total_items = sum(len(cat.get('items', [])) for cat in data.get('categories', []))
print(f"✓ Updated {total_items} menu items")
