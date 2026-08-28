import { BoxZone } from '@public/shared/polyzone/box.zone';

import { Story } from '../story';

export const Halloween2023Scenario2: Story = {
    name: 'Le crystal',
    dialog: {
        part1: {
            audio: 'audio/halloween-2023/scenario2/part1.mp3',
            text: [
                'Ồ chào buổi tối! Bạn có quay lại không? Hãy lắng nghe cẩn thận,',
                'Có vẻ như San Andreas đang hứng chịu thiên tai do viên pha lê này gây ra!',
                'Sẽ là khôn ngoan nếu hỏi người dân về việc viên pha lê xuất hiện như thế nào!',
                'Allez donc demander aux gens près du bar, quelqu’un a sûrement dû voir quelque chose.',
            ],
            timing: [3750, 5500, 4750, 4000],
        },
        part2: {
            audio: 'audio/halloween-2023/scenario2/part2.mp3',
            text: [
                "Suỵt.. Im đi! Tôi chắc chắn rằng tinh thể nghe thấy chúng tôi! Tất cả chúng ta đều sẽ chết...",
                'Tất cả chúng ta sẽ chết! Nó trồi lên khỏi mặt đất, CÁC NGƯỜI CÓ NGHE KHÔNG? NÓ ĐÃ CHUI LÊN TỪ LÒNG ĐẤT!',
                "ALLEZ DEMANDER A L'ALCOOLIQUE A L'INTERIEUR!",
            ],
            timing: [4125, 3750, 2500],
        },
        part3: {
            audio: 'audio/halloween-2023/scenario2/part3.mp3',
            text: [
                "Nghe này... Tôi sẽ không nói gì cho đến khi bạn mang cho tôi rượu mới...",
                "Et j'veux un truc fort !",
            ],
            timing: [3500, 2500],
        },
        part4: {
            audio: 'audio/halloween-2023/scenario2/part4.mp3',
            text: [
                'Ôi mẹ tốt quá! Tôi sẽ vỡ bụng với những gì bạn mang đến cho tôi!',
                'Thành thật mà nói, tôi chỉ khát nước thôi, nhưng tôi không có thông tin nào để cung cấp cho bạn…',
                'Peut-être que l’autre espionne sur le toit de la caravane a vu quelque chose… Gloups.',
            ],
            timing: [3500, 3500, 3500],
        },
        part5: {
            audio: 'audio/halloween-2023/scenario2/part5.mp3',
            text: [
                'Bạn đó! Tôi thấy bạn đang nói chuyện với các nhà khoa học!',
                "Tôi có thông tin quan trọng muốn cung cấp cho bạn.",
                'Trước khi tinh thể ra khỏi mặt đất',
                "j'ai vu les extraterrestres danser sous la pleine lune en agitant un étrange artéfact.",
                "Tôi lắng nghe họ từ xa và họ nói sẽ giấu nó đi.",
                'Theo tôi nhớ, họ đang nói về đầm lầy.',
                "Alors, je ne sais pas si j'ai très bien entendu",
                "nhưng dù sao tôi cũng hy vọng nó sẽ giúp ích cho bạn.",
            ],
            timing: [2750, 2150, 2150, 5150, 5000, 2500, 3000, 2750],
        },
        part6: {
            audio: 'audio/halloween-2023/scenario2/part6.mp3',
            text: [
                'Vậy đây là gì?... Bạn có một hiện vật kỳ lạ ở đó!',
                'Tôi nghĩ tôi đã nhìn thấy nó trong một số cuốn sách!',
                'Theo tôi nhớ, nó từng được sử dụng bởi một chủng tộc ngoài hành tinh.',
                'Tôi luôn nghĩ đó là một câu chuyện dành cho trẻ em...',
                'Dù thế nào đi nữa, cuộc điều tra đang tiến triển tốt!',
                'Xin chúc mừng, bạn là đối tác lý tưởng cho thiên tài của tôi!',
                'Đừng cảm ơn tôi, điều đó hoàn toàn bình thường.',
            ],
            timing: [4000, 3000, 3000, 3000, 3000, 5000, 3000],
        },
    },
    props: [{ model: 'm23_1_prop_m31_artifact_01a', coords: [-2078.01, 2614.61, 2.06], rotation: [0, 90, 0] }],
    zones: [
        {
            name: 'halloween_2023_scenario2_artefact',
            part: 5,
            label: 'Ramasser',
            icon: 'global/search',
            ...new BoxZone([-2077.8, 2614.5, 2.67], 0.4, 0.4, {
                heading: 198.64,
                minZ: 1.87,
                maxZ: 2.37,
            }),
        },
    ],
};

export const WinePrice = 500;
