import json

with open('menu-data-backup.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['venue']['name_ar'] = 'ريفايف ريفويل - فينالي'
data['venue']['member_discount_note_ar'] = 'خصم حصري 15٪ لأعضاء ريفايف'
data['venue']['loyalty_note_ar'] = 'يمكن لأعضاء ريفايف الحصول على بطاقة ولاء عند زيارة المتجر'

cat_trans = {
    'protein_shakes': 'مشروبات البروتين',
    'healthy_bowls': 'أطباق صحية',
    'chia_oats_delights': 'تشيا و الشوفان',
    'smoothies': 'سموذي',
    'wellness_shots': 'جرعات صحية',
    'fruits_cup': 'كوب الفواكه',
    'fresh_juices': 'عصائر طازجة'
}

item_trans = {
    'Blueberry Protein Shake': 'مخفوق البروتين بالتوت الأزرق',
    'Tropical Protein': 'مخفوق البروتين الاستوائي',
    'Chocolate Recovery': 'مخفوق الشوكولاتة للتعافي',
    'Beets N Berries': 'البنجر والتوت',
    'Pink Power Protein': 'مخفوق البروتين الوردي',
    'Tropical Green Protein': 'مخفوق البروتين الأخضر الاستوائي',
    'Morning Blend Protein': 'مخفوق الصباح المتوازن',
    'Peanut Butter Protein': 'مخفوق البروتين بزبدة الفول السوداني',
    'Blueberry Protein Bowl': 'وعاء البروتين بالتوت الأزرق',
    'Acai Bowl': 'وعاء الأساي',
    'Peanut Butter Delight Bowl': 'وعاء زبدة الفول السوداني',
    'Pink Oasis Bowl': 'وعاء الواحة الوردية',
    'Tropical Heaven Bowl': 'وعاء الجنة الاستوائية',
    'Green Dream Bowl': 'وعاء الحلم الأخضر',
    'Golden Sunrise Bowl': 'وعاء شروق الشمس الذهبي',
    'Chia Pudding with Mixed Fruit': 'بودينغ التشيا بالفواكه المشكلة',
    'Banana Peanut Butter Chia Pudding': 'بودينغ التشيا بالموز وزبدة الفول السوداني',
    'Vanilla Protein Overnight Oats': 'شوفان ليلي بالبروتين والفانيليا',
    'Chocolate Protein Overnight Oats': 'شوفان ليلي بالبروتين والشوكولاتة',
    'Immune Booster': 'معزز المناعة',
    'Energy Boost': 'دفعة طاقة',
    'Creamy Green': 'الأخضر الكريمي',
    'Mango Turmeric': 'مانجو بالكركم',
    'Fiber Aid': 'دعم الألياف',
    'Mango Tango': 'مانجو تانجو',
    'Healthy Blueberry Magic': 'سحر التوت الأزرق الصحي',
    'Feel Good': 'اشعر بالراحة',
    'Acai Smoothie': 'سموذي الأساي',
    'Blue Crush': 'بلو كراش',
    'Sleep Potion': 'مشروب النوم',
    'The Ginger Zinger': 'زنجبيل منشط',
    'Turmeric Sunshine': 'كركم مشرق',
    'Beetroot Boost': 'دفعة الشمندر',
    'Green Goodies': 'خيرات خضراء',
    'Pineapple Ginger Shot': 'أناناس بالزنجبيل',
    'Vitamin C Citrus Shot': 'جرعة فيتامين سي',
    'Garlic Honey Shot': 'عسل بالثوم',
    'Green Tea': 'شاي أخضر',
    'Carrot Ginger Shot': 'جزر بالزنجبيل',
    'Mango Bricks': 'مكعبات المانجو',
    'Kiwi Bricks': 'مكعبات الكيوي',
    'Pineapple Bricks': 'مكعبات الأناناس',
    'Carrot Bricks': 'مكعبات الجزر',
    'Orange Bricks': 'مكعبات البرتقال',
    'Avocado Bricks': 'مكعبات الأفوكادو',
    'Pomegranate (Seasonal)': 'رمان (موسمي)',
    'Grapefruit (Seasonal)': 'جريب فروت (موسمي)',
    'Banana': 'موز',
    'Mixed Cup': 'كوب فواكه مشكلة',
    'Orange Juice': 'عصير برتقال',
    'Apple Juice': 'عصير تفاح',
    'Mango Juice': 'عصير مانجو',
    'Avocado Juice': 'عصير أفوكادو',
    'Carrot Juice': 'عصير جزر',
    'Kiwi Juice': 'عصير كيوي',
    'Pineapple Juice': 'عصير أناناس',
    'Tender Coconut Juice': 'عصير جوز الهند الطازج'
}

for cat in data['categories']:
    cat['name_ar'] = cat_trans.get(cat['key'], '')
    for item in cat['items']:
        item['name_ar'] = item_trans.get(item['name_en'], '')

with open('menu-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('✓ All Arabic translations added successfully!')
print(f'✓ Updated {len(data["categories"])} categories')
total_items = sum(len(cat['items']) for cat in data['categories'])
print(f'✓ Updated {total_items} items')
