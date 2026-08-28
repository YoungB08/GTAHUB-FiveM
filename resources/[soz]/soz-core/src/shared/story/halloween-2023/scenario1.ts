import { BoxZone } from '@public/shared/polyzone/box.zone';

import { Story } from '../story';

export const Halloween2023Scenario1Alcool = ['horror_cauldron', 'halloween_bloody_mary', 'halloween_spectral_elixir'];

export const Halloween2023Scenario1: Story = {
    name: 'Les échoués',
    dialog: {
        part1: {
            audio: 'audio/halloween-2023/scenario1/part1.mp3',
            text: [
                'Tránh đường, tránh đường! Xin hãy bình tĩnh!',
                'Tất cả những gì chúng tôi biết là kể từ sáng nay,',
                'plusieurs animaux marins géants se sont échoués sur San Andreas.',
                'Chúng rất giống động vật thời tiền sử,',
                'mà cho đến nay đã hoàn toàn tuyệt chủng.',
                'Chúng tôi không thể cung cấp cho bạn thêm thông tin.',
                'Các chuyên gia khoa học của chúng tôi tại Human Labs hiện đang nghiên cứu bí ẩn mới này.',
                'Hãy hỏi ý kiến ​​của những người có thẩm quyền! Hãy bình tĩnh ngay bây giờ!',
            ],
            timing: [3500, 2500, 3500, 3000, 2000, 3000, 4500, 4000],
        },
        part2: {
            audio: 'audio/halloween-2023/scenario1/part2.mp3',
            text: [
                "Xin chào xin chào! Tôi đoán rằng bạn chắc hẳn là điều tra viên mới của chúng tôi?",
                'Très bien, très bien.',
                "Selon nos dernières analyses, ce phénomène fait suite à l'éruption d'un volcan.",
                'Một ngọn núi lửa có thể nhấn chìm hoàn toàn hòn đảo lân cận!',
                'Bạn có tin điều đó không? Một thảm họa thực sự!',
                'Những người mắc kẹt sẽ đến từ đáy biển của hòn đảo này,',
                'qui suite à l’éruption, aurait été déplacé jusqu’à San Andreas.',
                'Très étrange, je le conçois…',
                'Tôi cần bạn tìm một số yếu tố để tôi có thể tiếp tục phân tích.',
                'Vật phẩm đầu tiên được tìm thấy trên một con cá voi mắc cạn, gần Cayo Perico.',
                'Hãy thu hoạch và mang về cho tôi. Đối với yếu tố thứ hai, tôi cần 20 con cá,',
                'ils me serviront à analyser les fonds marins. Allez, au boulot !',
            ],
            timing: [4125, 1125, 4000, 3000, 3000, 2750, 3125, 1500, 4500, 3750, 4125, 3500],
        },
        part3: {
            audio: 'audio/halloween-2023/scenario1/part3.mp3',
            text: [
                'Tuyệt vời, xuất sắc! Cảm ơn bạn đã mang tất cả những điều này đến cho tôi.',
                'Je vais pouvoir effectuer de plus profondes analyses afin de mieux observer ce phénomène.',
                'Ồ, tôi cũng sẽ cần Joel, một người bạn cũ!',
                'Il serait en mesure de m’aider à approfondir le sujet.',
                'Ses talents et sa perspicacité nous seront utiles.',
                'Tuy nhiên tôi không biết bây giờ anh ấy đang ở đâu.',
                'Lần cuối cùng tôi nghe nói, anh ấy là thuyền trưởng của một tàu chở hàng gần chỗ bác sĩ. Hãy tìm hiểu đi!',
            ],
            timing: [4000, 4000, 3500, 2750, 3000, 3000, 5000],
        },
        part4: {
            audio: 'audio/halloween-2023/scenario1/part4.mp3',
            text: [
                "Joël ? C'est bien moi oui.",
                "Bạn không muốn uống gì trong khi kể cho tôi nghe câu chuyện của bạn sao?",
                "Y'en a plein sur le navire.",
                'Mmh ... je comprends mieux ...',
                "Tôi không ngại giúp bạn, nhưng chiếc tàu chở hàng này không thể rời đi nếu không có thuyền trưởng!",
                'Bạn nhất định phải tìm cho tôi người thay thế, nếu không thì không thể giúp được bạn.',
                "J'en connais un qui devrait être intéressé ... même s'il est retraité.",
                'Hãy đến gặp anh ấy, anh ấy từng câu cá gần đầm lầy San Andreas!',
            ],
            timing: [2500, 3500, 1500, 2500, 6000, 5000, 5000, 4000],
        },
        part5: {
            audio: 'audio/halloween-2023/scenario1/part5.mp3',
            text: [
                'Chờ đã... Đợi đã... Tôi sẽ lấy nó, im đi... ... Chết tiệt, tôi lại bỏ lỡ nó rồi!',
                'Oh... Ecoutez, je suis un homme simple',
                'Tôi muốn lái chiếc máy bay chở hàng này để Joël có thể giúp bạn,',
                'nhưng hãy mang cho tôi một trong những loại cocktail độc quyền!',
            ],
            timing: [7500, 4000, 2000, 2500],
        },
        part6: {
            audio: 'audio/halloween-2023/scenario1/part6.mp3',
            text: [
                'Vâng, hoàn hảo! Cảm ơn vì ly cocktail này...',
                'Mmmmh, Mmmmmh. MMMMH IL EST DELICIEUX ! Oh... Oh, Prévenez Joël, je le remplace !',
            ],
            timing: [3000, 6000],
        },
        part7: {
            audio: 'audio/halloween-2023/scenario1/part7.mp3',
            text: [
                'Il a accepté ? Merveilleux !',
                'À, một lời khuyên nhỏ, lát nữa hãy đến pha lê, hẹn gặp lại vào ngày mai!...',
            ],
            timing: [3000, 7000],
        },
    },
    zones: [
        {
            name: 'deadwhale',
            part: 2,
            label: 'Récolter',
            icon: 'global/search',
            ...new BoxZone([4768.34, -4725.53, 1.78], 3.6, 11.8, {
                heading: 141.49,
                minZ: 0.78,
                maxZ: 2.78,
            }),
        },
    ],
};
