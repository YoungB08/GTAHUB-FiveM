const fs = require('fs');
const path = 'd:/FiveM/SOZ-FiveM-Server/resources/[qb]/qb-core/shared/items.lua';

console.log('Reading items.lua...');
let content = fs.readFileSync(path, 'utf8');

// Dictionary of exact and keyword translations for French -> Vietnamese
const translations = {
    // Weapons
    "Poings.": "Tay không",
    "Coups de poings.": "Đấm bằng tay không.",
    "Dague antique": "Dao găm cổ",
    "Une large dague, semblable à une épée.": "Một con dao găm lớn, tương tự như đoản kiếm.",
    "Batte de baseball": "Gậy bóng chày",
    "Pour claquer ton plus beau home run !": "Dùng để đánh bóng chày hoặc tự vệ.",
    "Pioche": "Cuốc chim",
    "Piochez ! Piochez !": "Dụng cụ dùng để đào khoáng sản.",
    "Bouteille brisée": "Chai vỡ",
    "Une bouteille brisée": "Một vỏ chai thủy tinh bị vỡ sắc nhọn.",
    "Pied de biche": "Xà bén",
    "Barre de métal utilisée pour forcer des portes, ou forcer des crânes.": "Thanh kim loại dùng để cạy cửa hoặc tự vệ.",
    "Lampe de poche": "Đèn pin",
    "Pour voir dans le noir !": "Dùng để chiếu sáng trong bóng tối.",
    "Lampe UV Scientifique": "Đèn UV Pháp y",
    "Idéale pour se croire dans un film.": "Đèn tia cực tím chuyên dụng để soi dấu vết hiện trường.",
    "Club de golf": "Gậy đánh golf",
    "Pour faire un trou en un coup.": "Gậy chơi golf thể thao.",
    "Marteau": "Cây búa",
    "Pour enfoncer des clous, ou des têtes.": "Dụng cụ dùng để đóng đinh hoặc sửa chữa.",
    "Hachette": "Rìu nhỏ",
    "Une petite hache bien aiguisée.": "Rìu nhỏ cầm tay được mài bén.",
    "Couteau": "Dao găm",
    "Une lame tranchante.": "Một con dao sắc bén.",
    "Machette": "Dao rựa",
    "Pour couper des herbes hautes, ou des bras.": "Dao rựa lớn chuyên dùng phát quang hoặc tự vệ.",
    "Lampe torche": "Đèn pin cầm tay",
    "Cran d'arrêt": "Dao bấm",
    "Clé anglaise": "Mỏ lết",
    "Pour serrer des boulons.": "Dụng cụ dùng để vặn ốc và bu lông.",
    "Hache de combat": "Rìu chiến",
    "Matraque": "Dùi cui cảnh sát",
    "Matraque de police.": "Dùi cui tiêu chuẩn của lực lượng thực thi pháp luật.",
    "Couteau à cran d'arrêt": "Dao bấm gấp",

    // Firearms
    "Pistolet": "Súng lục 9mm",
    "Pistolet de combat": "Súng lục chiến thuật",
    "Pistolet AP": "Súng lục tự động AP",
    "Pistolet lourd": "Súng lục hạng nặng",
    "Pistolet vintage": "Súng lục cổ điển",
    "Revolver": "Súng lục ổ quay Revolver",
    "Pistolet SNS": "Súng lục nhỏ SNS",
    "Pistolet perforant": "Súng lục xuyên giáp",
    "Pistolet cal.50": "Súng lục Desert Eagle .50",
    "Pistolet paralysant": "Súng điện Taser",
    "Pistolet de détresse": "Súng bắn pháo sáng",

    // SMG & Rifles
    "Mitraillette": "Súng tiểu liên Micro SMG",
    "Mitraillette tactique": "Tiểu liên chiến thuật",
    "Mitraillette d'assaut": "Tiểu liên xung kích",
    "Pistolet mitrailleur": "Súng tiểu liên MP5",
    "Mitraillette Thompson": "Tiểu liên Thompson (Gusenberg)",
    "Fusil d'assaut": "Súng trường tấn công AK-47",
    "Carabine": "Súng trường Carabine M4A1",
    "Carabine spéciale": "Súng trường đặc biệt G36C",
    "Fusil compact": "Súng trường mini Compact",
    "Fusil lourd": "Súng trường hạng nặng",
    "Fusil militaire": "Súng trường quân sự AUG",

    // Shotguns & Snipers
    "Fusil à pompe": "Súng săn ghém Pump Shotgun",
    "Fusil à canon scié": "Súng ngắn hai nòng cưa",
    "Fusil de précision": "Súng bắn tỉa Sniper",
    "Fusil de précision lourd": "Súng bắn tỉa hạng nặng Heavy Sniper",
    "Fusil de tireur d'élite": "Súng tỉa thiện xạ Marksman",

    // Ammo
    "Munitions 9mm": "Hộp đạn 9mm",
    "Munitions .45 ACP": "Hộp đạn .45 ACP",
    "Munitions Calibre 12": "Hộp đạn Calibre 12",
    "Munitions 5.56mm": "Hộp đạn 5.56mm",
    "Munitions 7.62mm": "Hộp đạn 7.62mm",
    "Munitions .50": "Hộp đạn .50 Cal",
    "Munitions Sniper": "Hộp đạn súng bắn tỉa",
    "Cartouches de taser": "Đạn súng điện Taser",

    // Food & Drinks
    "Pain": "Bánh mì",
    "Bouteille d'eau": "Chai nước suối",
    "Eau": "Nước uống",
    "Café": "Cà phê",
    "Sandwich": "Bánh mì kẹp Sandwich",
    "Burger": "Bánh Burger",
    "Pizza": "Bánh Pizza",
    "Frites": "Khoai tây chiên",
    "Bière": "Bia",
    "Vin": "Rượu vang",
    "Vodka": "Rượu Vodka",
    "Whisky": "Rượu Whisky",
    "Rhum": "Rượu Rhum",
    "Tequila": "Rượu Tequila",
    "Soda": "Nước ngọt có ga",
    "Jus de pomme": "Nước ép táo",
    "Jus d'orange": "Nước ép cam",
    "Jus de raisin": "Nước ép nho",
    "Chocolat": "Thanh sô cô la",
    "Donut": "Bánh Donut",
    "Salade": "Món Salad",
    "Fromage": "Phô mai",
    "Pomme": "Quả táo",
    "Banane": "Quả chuối",
    "Orange": "Quả cam",
    "Raisin": "Chùm nho",
    "Viande": "Miếng thịt tươi",
    "Poisson": "Cá tươi",

    // Common tools & materials
    "Téléphone": "Điện thoại thông minh",
    "Radio": "Bộ đàm Radio",
    "Kit de crochetage": "Bộ móc khóa (Lockpick)",
    "Kit de réparation": "Bộ sửa chữa xe hơi",
    "Kit de nettoyage": "Bộ dụng cụ vệ sinh xe",
    "Kit de premiers secours": "Hộp sơ cứu y tế",
    "Bandage": "Băng gạc cứu thương",
    "Menottes": "Còng tay cảnh sát",
    "Clé de menottes": "Chìa khóa còng tay",
    "Gilet pare-balles": "Áo giáp chống đạn",
    "Gilet pare-balles lourd": "Áo giáp chống đạn hạng nặng",
    "Permis de conduire": "Bằng lái xe",
    "Carte d'identité": "Thẻ căn cước công dân",
    "Carte bancaire": "Thẻ ATM Ngân hàng",
    "Passeport": "Hộ chiếu",
    "Bidon d'essence": "Can xăng dự phòng",
    "Câble de démarrage": "Dây kích bình ắc quy",
    "Pneu de secours": "Lốp xe dự phòng",
    "Boîte à outils": "Hộp đồ nghề sửa chữa",
    "Canne à pêche": "Cần câu cá",
    "Appât de pêche": "Mồi câu cá",
    "Lingot d'or": "Thỏi vàng nguyên chất",
    "Sac d'argent": "Túi tiền mặt",
    "Argent sale": "Tiền đen (tiền bẩn)",
    "Diamant": "Viên kim cương",
    "Minerai de fer": "Quặng sắt",
    "Minerai de cuivre": "Quặng đồng",
    "Lingot de fer": "Thỏi sắt",
    "Lingot de cuivre": "Thỏi đồng",
    "Bois": "Khúc gỗ",
    "Planche de bois": "Thanh ván gỗ",
    "Tissu": "Cuộn vải may mặc",
    "Fil": "Cuộn chỉ may",
    "Cigarette": "Gói thuốc lá",
    "Briquet": "Bật lửa",
    "Joint": "Điếu cần sa",
    "Pochon de weed": "Gói cỏ cần sa",
    "Pochon de cocaïne": "Gói ma túy Cocaine",
    "Pochon de meth": "Gói ma túy đá Meth",
};

// Replace exact label matches
let replacedCount = 0;

// Regular expression to find and replace labels
content = content.replace(/(\["label"\]\s*=\s*")([^"]+)(")/g, (match, prefix, label, suffix) => {
    if (translations[label]) {
        replacedCount++;
        return `${prefix}${translations[label]}${suffix}`;
    }
    return match;
});

// Common french patterns replacement for descriptions & remaining labels
const patternReplacements = [
    // Description patterns
    [/Une bouteille d'eau/g, "Một chai nước khoáng thiên nhiên."],
    [/Une portion de frites/g, "Một phần khoai tây chiên giòn."],
    [/Un délicieux burger/g, "Một chiếc bánh burger thơm ngon."],
    [/Un sandwich bien garni/g, "Một chiếc bánh mì kẹp thơm ngon."],
    [/Permet de crocheter des serrures/g, "Dụng cụ dùng để mở khóa phương tiện hoặc cánh cửa."],
    [/Permet de réparer un véhicule/g, "Dùng để sửa chữa tạm thời xe bị hư hỏng."],
    [/Permet de nettoyer un véhicule/g, "Dùng để lau chùi và rửa sạch xe."],
    [/Soigne les blessures légères/g, "Dùng để băng bó và hồi phục vết thương."],
    [/Protège contre les tirs/g, "Áo giáp bảo vệ cơ thể khỏi đạn đạo và sát thương."],
    [/Permet de pêcher des poissons/g, "Dụng cụ dùng để câu cá."],
    [/Permet de communiquer à distance/g, "Dùng để liên lạc qua các tần số vô tuyến."],
    [/Un bidon rempli d'essence/g, "Bình chứa xăng dùng để tiếp nhiên liệu cho xe."],
    [/Munitions pour armes/g, "Đạn tiêu chuẩn dùng cho các loại súng phù hợp."],
];

for (const [regex, rep] of patternReplacements) {
    content = content.replace(regex, rep);
}

fs.writeFileSync(path, content, 'utf8');
console.log(`Successfully updated items.lua with translated labels! Replaced count: ${replacedCount}`);
