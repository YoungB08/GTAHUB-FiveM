import { Story } from '../story';

export const Halloween2022Scenario4EnterFinal = 'Halloween2022Scenario4EnterFinal';
export const Halloween2022Scenario4ExitFinal = 'Halloween2022Scenario4ExitFinal';

export const Halloween2022Scenario4: Story = {
    name: 'Halloween 2022 Scenario 4',
    dialog: {
        part1: {
            audio: 'audio/halloween-2022/scenario4/part1.mp3',
            text: [
                'Hop hop hop! Bạn đang đi đâu thế này?',
                'Xin lỗi, cho đến khi bạn có được sự cho phép của mình,',
                'Tôi không thể giải thích tình hình cho bạn.',
                'Hãy thử đến văn phòng Paleto, họ sẽ có thể cung cấp cho bạn một cái!',
            ],
            timing: [2500, 2000, 2000, 5500],
        },
        part2: {
            audio: 'audio/halloween-2022/scenario4/part2.mp3',
            text: [
                'Bạn muốn điều tra trường đại học?',
                'Nghe này, tất cả những điều này đều nằm ngoài khả năng của tôi... Câu chuyện này, FBI có liên quan,',
                'Tôi không muốn liên quan gì đến chuyện đó nữa!',
                'Hãy nhận giấy ủy quyền này và gửi lại cho Đại lý.',
                'Tôi sẽ rời khỏi đây, tôi không thể chịu đựng được nữa.',
            ],
            timing: [1500, 5000, 2000, 2500, 2000],
        },
        part3: {
            audio: 'audio/halloween-2022/scenario4/part3.mp3',
            text: [
                'Bạn đã nhận được ủy quyền chưa?',
                'Ở đây chúng tôi đang chuyển một vấn đề quan trọng như vậy cho những người nghiệp dư...',
                'Bref. Ecoutez, voici la situation.',
                "Thông tin của chúng tôi cho thấy sự tồn tại của Người ngoài hành tinh trong khu vực.",
                "Thật không may, con đường của chúng tôi kết thúc ở đây.",
                'Cela fait déjà plusieurs heures que nous avons encerclé le bâtiment,',
                "và cho đến nay, không có dấu vết nào của người ngoài hành tinh chết tiệt đó.",
                "Chúng ta không thể lãng phí thời gian nữa. Nếu anh ấy vẫn còn ở đó, chúng ta cần tìm anh ấy.",
                'Bây giờ bạn sẽ tìm kiếm trường đại học này từ trên xuống dưới,',
                'và bắt tay vào thực hiện nó!',
            ],
            timing: [2000, 3000, 2000, 3500, 1800, 2700, 2750, 4000, 3500, 1500],
        },
        part4: {
            audio: 'audio/halloween-2022/scenario4/part4.mp3',
            text: [
                "Thoạt nhìn, những gì bạn vừa nghe có vẻ hoàn toàn khó hiểu đối với bạn.",
                'Tuy nhiên, bằng một cách nào đó chưa được biết,',
                'tâm trí của bạn quản lý để dịch những gì nó đang cố gắng truyền đạt cho bạn.',
                'Với tư cách là một người bạn, anh ấy không muốn làm hại ai.',
                "Theo một cách khá mờ ảo, bạn nhìn thấy một cánh cửa, trong một đường hầm gần Núi Chiliad.",
                "Đến đó chắc chắn sẽ cho bạn câu trả lời.",
            ],
            timing: [9500, 2000, 4000, 3800, 5000, 3500],
        },
        part5: {
            audio: 'audio/halloween-2022/scenario4/part5.mp3',
            text: [
                'Nhìn kỹ hơn vào cánh cửa, bạn nhận thấy một thiết bị khéo léo ở bên phải.',
                'Một khe trống nhanh chóng khiến bạn hiểu',
                'rằng bạn đang thiếu cái gì đó để có thể bước vào nó.',
                'Đang loay hoay tìm kiếm manh mối, bạn nhận thấy',
                'un écriteau mentionnant les mots “Camp, Est, Peace”.',
                'Có lẽ đây là đầu mối bạn nên đi đâu?',
            ],
            timing: [6000, 3000, 3000, 3000, 3000, 3000],
        },
        part6: {
            audio: '',
            text: [],
        },
        part7: {
            audio: 'audio/halloween-2022/scenario4/part7.mp3',
            text: [
                'Ồ, nhưng bạn đang ở đó.',
                "Vậy ra đó là bạn, thám tử mới của chúng tôi,",
                'người đã có thể giải được tất cả các câu đố gần đây.',
                'Chiến công của bạn đang vang dội khắp San Andréas, tên tuổi của bạn đang được biết đến, bạn có biết điều đó không?',
                'Meurtre, fausse légende et disparition inquiétante,',
                'bạn đã vượt qua rất nhiều trở ngại để đến được đây.',
                "Sự hiện diện của bạn trên đảo đã trở nên quan trọng hơn,",
                'Tôi chỉ có thể cảm ơn sự cống hiến của bạn.',
                'Những cuộc phiêu lưu mới đang chờ đợi bạn!',
                'Peut-être pas immédiatement, mais prochainement.',
                "Chắc chắn chúng ta sẽ có cơ hội gặp lại nhau,",
                "Cho đến lúc đó, tôi chúc bạn may mắn.",
            ],
            timing: [1800, 2000, 3000, 4500, 3000, 2500, 3000, 2500, 2000, 3000, 3000, 2000],
        },
    },
    zones: [
        {
            name: 'scenario4_door_chiliad',
            part: 5,
            label: 'Inspecter',
            icon: 'global/search',
            center: [-263.67, 4729.01, 137.92],
            length: 0.4,
            width: 1.45,
            heading: 321,
            minZ: 135.87,
            maxZ: 139.87,
        },
        {
            name: 'aliens',
            part: 6,
            label: 'Inspecter',
            icon: 'global/search',
            center: [2328.64, 2571.04, 46.71],
            length: 5.6,
            width: 3.0,
            heading: 335,
            minZ: 44.16,
            maxZ: 48.16,
        },
    ],
};
