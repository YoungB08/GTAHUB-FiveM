import { FishItem } from './item';

export interface PlayerFish {
    citizenId: string;
    fishId: string;
    quantity: number;
    maxWidth: number;
    maxWeight: number;
    maxResell: number;
    lastFishAt: Date;
}

export interface FishWithCompletion extends FishItem {
    completion: {
        quantity: number;
        maxWidth: number;
        maxWeight: number;
        maxResell: number;
        lastFishAt: Date;
        fishTier: any;
    };
}

export enum Localisation {
    littoral = 'Bords de mer',
    north_sea = 'Mer Nord',
    south_sea = 'Mer Sud',
    big_lake = 'Grand Lac',
    little_lake = 'Petits Lacs',
    river = 'Rivières',
    canals = 'Canaux',
    global = 'Global',
}

export const sozedexStatsZones = {
    global: {
        titre: {
            classic: 'Complétion du Sozédex',
            halloween: 'Découvertes Macabres',
            vampire: 'Secrets Sanguinaires',
            summer: 'Voyage tropical',
            winter: 'Horizons gelées',
        },
        description: {
            classic:
                "Sozédex mô tả hệ động vật và thực vật biển của San Andreas. Mỗi khám phá được viết trong cuốn sách nhằm thiết lập nền tảng kiến ​​thức.",
            halloween:
                'Bây giờ là lúc để khám phá những trang này chứa đầy những sinh vật quái dị và ma quỷ mà chỉ có mồi của quỷ dữ mới có thể tìm ra được.',
            vampire:
                'Khám phá những trang tối tăm này, nơi những sinh vật bí ẩn, khó nắm bắt ẩn nấp, bị bao phủ trong bóng tối và khát máu.',
            summer: 'Khám phá các trang của cuộc hành trình chứa đầy sinh vật này, mỗi trang đều đáng ngạc nhiên hơn trang trước, trong môi trường phi thường này.',
            winter: 'Khám phá các trang của cuộc hành trình chứa đầy những sinh vật băng giá, bí ẩn và hấp dẫn này, trong môi trường đóng băng trong giá lạnh này.',
        },
        rewardTitle: {
            classic: 'Bạn đã thành công!',
            halloween: 'Bạn đã thành công!',
            vampire: 'Bạn là người chiến thắng!',
            summer: 'Bạn đã thành công!',
            winter: 'Bạn đã thành công!',
        },
        rewardDescription: {
            classic:
                "Bạn vừa câu được hết số cá được biết đến trên đảo tính đến thời điểm hiện tại. Đây là phần thưởng của bạn.",
            halloween:
                "Bạn đã thành công trong việc khám phá hết những điều quái dị hiện diện trên đảo. Đây là phần thưởng của bạn.",
            vampire:
                "Bạn đã dũng cảm vượt qua bóng tối và khám phá tất cả những bí mật ẩn giấu của San Andreas, chiến thắng những sinh vật đen tối nhất. Đây là phần thưởng của bạn.",
            summer: 'Bạn đã thành công trong việc khám phá tất cả các loài ít được biết đến của môi trường này. Đây là phần thưởng của bạn.',
            winter: 'Bạn đã thành công trong việc khám phá tất cả các loài ẩn chứa trong khung cảnh mùa đông này. Đây là phần thưởng của bạn',
        },
    },
    zones: [
        {
            side: 'left',
            label: {
                classic: Localisation.littoral,
                halloween: 'Bờ Biển Bóng Tối',
                vampire: 'Bờ biển Manes',
                summer: 'Côtes submergées',
                winter: 'Côtes gelées',
            },
            name: 'littoral',
            descriptions: {
                classic:
                    "Giữa đất liền và biển, bờ biển San Andreas có rất nhiều san hô và động vật biển đủ loại.",
                halloween:
                    'Giữa đất liền và biển, bờ biển San Andreas bộc lộ độ sâu ác mộng, nơi san hô biến dạng và các sinh vật biển đột biến lang thang, thèm ăn thịt người.',
                vampire:
                    'Bờ biển San Andreas chìm trong bóng tối là nơi sinh sống của những sinh vật sống về đêm, bị thu hút bởi mùi máu và bầu không khí bí ẩn của màn đêm.',
                summer: 'Từng nằm giữa đất liền và biển, bờ biển San Andreas tràn ngập san hô và những sinh vật đầy màu sắc. Và bây giờ..?',
                winter: 'Từng được lót bằng cát và sóng, bờ biển San Andreas giờ đây bị đóng băng dưới một lớp băng dày, nơi những dạng sống bất ngờ phát triển mạnh',
            },
        },
        {
            side: 'left',
            label: {
                classic: Localisation.river,
                halloween: 'Fleuves Ténébreux',
                vampire: 'Fleuves Pourpres',
                summer: 'Fleuves Oubliés',
                winter: 'Fleuves Cristallisés',
            },
            name: 'river',
            descriptions: {
                classic:
                    'De nombreuses rivières parcourent San Andreas, regorgeant de nombreuses et surprenantes créatures.',
                halloween:
                    'Những dòng sông quanh co ở San Andreas ẩn chứa những bí mật kinh hoàng, nơi sinh sống của những sinh vật khó nắm bắt trỗi dậy từ vùng nước tối tăm để ăn thịt những linh hồn lạc lối.',
                vampire:
                    'Những dòng sông màu tím của San Andreas ẩn giấu những bí mật bị cấm, nơi những sinh vật vĩnh cửu giải khát trong sự tĩnh lặng của màn đêm, trông chừng lãnh thổ cổ xưa của họ.',
                summer: "Sau thảm họa như vậy, điều gì đã xảy ra với các sinh vật sông?",
                winter: 'Sau thảm họa như vậy, các sinh vật sông đã thích nghi hay bị lạc dưới làn nước băng giá?',
            },
        },
        {
            side: 'left',
            label: {
                classic: Localisation.south_sea,
                halloween: 'Mer de la Nuit',
                vampire: 'Biển Than Khóc',
                summer: "Crique d'Émeraude",
                winter: 'Crique de glace',
            },
            name: 'south_sea',
            descriptions: {
                classic: "La Mer du Sud qui borde l'île de Cayo Perico est chaude et peuplée de race exotiques.",
                halloween:
                    "Biển Nam bao quanh đảo Cayo Perico thực sự là một địa ngục dưới nước, nơi những sinh vật kỳ lạ và tà ác phát triển trong vực thẳm, kiên nhẫn chờ đợi du khách dấn thân vào vực sâu chết chóc của chúng.",
                vampire:
                    'Biển Than Khóc là nơi sinh sống của những sinh vật khát máu, di chuyển lặng lẽ qua vùng nước tối tăm, dụ dỗ những linh hồn lạc lối đến cùng.',
                summer: 'La Mer du Sud autrefois calme et paradisiaque est désormais remplie de dangers et de phénomènes de grande ampleur.',
                winter: "Biển Nam vốn êm đềm và tựa thiên đường giờ đây bị mắc kẹt trong một lớp băng vĩnh cửu, nơi nguy hiểm rình rập ở mỗi bước đi.",
            },
        },
        {
            side: 'right',
            label: {
                classic: Localisation.north_sea,
                halloween: 'Abysses du Nord',
                vampire: 'Abysses Obscurs',
                summer: 'Vịnh sương mù',
                winter: 'Vịnh sương mù đông lạnh',
            },
            name: 'north_sea',
            descriptions: {
                classic:
                    'La Mer du Nord, bordant paleto et abrite de nombreuses petites îles habitée par les crustacés et les grands animaux marins.',
                halloween:
                    "Biển Bắc, giáp với Vịnh Paleto, ẩn chứa những hòn đảo bị nguyền rủa, hang ổ của những sinh vật biển dị dạng, nơi bóng tối ngự trị và những thủy thủ liều lĩnh trở thành con mồi cho những con quái vật rình mò.",
                vampire:
                    'Vực thẳm bóng tối là vương quốc của những sinh vật bị nguyền rủa, chúng canh gác trong bóng tối và nuôi dưỡng cơn khát vô độ cho bất kỳ ai dám quấy rầy giấc ngủ của họ.',
                summer: 'Biển Bắc giáp ranh với Paleto giờ đây tối tăm và bí ẩn, đừng để bị cuốn theo ...',
                winter: 'Biển Bắc, giáp với Paleto, trở nên tối tăm và lạnh lẽo, bao phủ trong sương mù băng giá. Hãy cẩn thận kẻo bị lạc...',
            },
        },
        {
            side: 'right',
            label: {
                classic: Localisation.big_lake,
                halloween: "Lac de l'Effroi",
                vampire: 'Lac Sombre',
                summer: "Désert d'Alamo",
                winter: 'Désert de Givre',
            },
            name: 'big_lake',
            descriptions: {
                classic:
                    "Hồ San Andreas rộng lớn, nằm gần Sandy Shore và có biệt danh là Biển Alamo, được bao phủ bởi một lớp băng dày vào mùa đông.",
                halloween:
                    "Hồ lớn của San Andreas, biển Alamo, không chỉ đóng băng vào mùa đông mà còn là nơi an nghỉ của các thế lực ma quỷ ẩn nấp dưới lớp băng, sẵn sàng nổi lên để trừng phạt những kẻ xâm nhập táo bạo.",
                vampire:
                    "Hồ Tối, nhuốm màu đỏ theo truyền thuyết của San Andreas, thu hút các sinh vật ma cà rồng, nơi không ai mạo hiểm mà không sợ máu của họ.",
                summer: "Cát, đá, đó là tất cả những gì còn lại của Biển Alamo...",
                winter: 'Cát và đá? Đó chỉ là ký ức thôi. Bây giờ biển Alamo là một vùng đất hoang băng giá, bị cuốn theo những cơn gió buốt giá.',
            },
        },
        {
            side: 'right',
            label: {
                classic: Localisation.little_lake,
                halloween: 'Étangs Sombres',
                vampire: 'Étangs Morts',
                summer: 'Étendues de Sables',
                winter: 'Étendues Givrées',
            },
            name: 'little_lake',
            descriptions: {
                classic:
                    "Nhiều hồ nhỏ tô điểm cho vùng đồng bằng và thung lũng của đảo San Andreas, xứng đáng là những ai quan sát được tất cả.",
                halloween:
                    "Những hồ nước nhỏ, yên tĩnh nằm rải rác trên vùng đồng bằng và thung lũng của đảo San Andreas ẩn chứa những bí mật tà ác và những ai dám khám phá chúng có nguy cơ gặp phải những nỗi kinh hoàng không thể tả xiết.",
                vampire:
                    'Ao Chết che giấu sự hiện diện vĩnh cửu, vô hình trước mắt con người, nhưng rất thực đối với những người có sức mạnh ma cà rồng.',
                summer: "Đã từng có những hồ nhỏ nằm rải rác trên đồng bằng và thung lũng San Andreas. Tất cả còn lại chỉ là cát và sỏi.",
                winter: 'Từng rải rác với những hồ nước lấp lánh, đồng bằng và thung lũng của San Andreas giờ đây được bao phủ bởi một lớp băng và tuyết dày.',
            },
        },
        {
            side: 'right',
            label: {
                classic: Localisation.canals,
                halloween: 'Canaux du Cauchemar',
                vampire: 'Canaux de la Nuit',
                summer: 'Quartiers Engloutis',
                winter: 'Quartiers Figés',
            },
            name: 'canals',
            descriptions: {
                classic:
                    "Các thị trấn khác nhau của San Andreas là nơi có nhiều kênh tưới tiêu và giải trí khác nhau; bạn có thể gặp những điều kỳ lạ ở đó.",
                halloween:
                    "Các kênh tưới tiêu và giải trí uốn lượn qua các thị trấn San Andreas bị ám ảnh bởi những sự hiện diện nham hiểm, những bóng đen kỳ lạ di chuyển trong làn nước đen, chờ đợi để bẫy bất cứ ai dám đi quá xa vào những lối đi tối tăm của chúng.",
                vampire:
                    'Kênh Bóng Đêm là những lối đi bí mật được sử dụng bởi những sinh vật khát máu, vô hình trước mắt con người nhưng sẵn sàng lộ diện khi có tiếng thì thầm nhỏ nhất.',
                summer: "La météorite a englouti les canaux et les quartiers irrigés, de nouvelles créatures s'y sont cachées..",
                winter: 'Thiên thạch đã khiến các kênh đào và khu dân cư từng tồn tại dưới lớp băng. Những sinh vật mới đã thích nghi với cái lạnh không ngừng này, ẩn náu trong bóng tối của băng.',
            },
        },
    ],
};
