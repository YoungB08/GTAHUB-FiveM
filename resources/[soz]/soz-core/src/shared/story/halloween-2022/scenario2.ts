import { Story } from '../story';

export const Halloween2022Scenario2: Story = {
    name: 'L’homme au phare',
    dialog: {
        part1: {
            audio: 'audio/halloween-2022/scenario2/part1.mp3',
            text: [
                'Ồ, chào buổi tối các bạn trẻ. Đêm rất tối phải không?',
                'Hãy để tôi kể cho bạn một câu chuyện nhỏ. Bạn sẽ không hối tiếc!',
                'Truyền thuyết kể rằng một trong những hòn đảo được thắp sáng bởi ngọn hải đăng là nơi có một ngôi nhà chưa hoàn thiện...',
                'Tác giả của ngôi nhà này sẽ là một cặp vợ chồng trẻ,',
                'fous amoureux, rêvaient de bâtir ensemble leur logement, loin de la ville.',
                'Mais soudainement, la mer se déchaîna, leur hurlant d’arrêter la construction !',
                'Refusant d’écouter les voix qu’ils entendaient,',
                'ils se firent emporter par la marée, laissant comme seul avertissement,',
                'chiếc thuyền mà cặp đôi đã dùng để đến hòn đảo cũng như phần còn lại của ngôi nhà…',
                'Kể từ đó, không ai quay trở lại đó nữa!',
                'Truyền thuyết kể rằng như một lời cảnh báo, biển đã bỏ lại phía sau,',
                'đâu đó trên đảo, chân của một trong những nạn nhân...',
            ],
        },
        part2: {
            audio: 'audio/halloween-2022/scenario2/part2.mp3',
            text: [
                'Mon chéri, mon homme, mon amour… Je suis désolé…',
                'Tôi buộc bạn phải ở lại hòn đảo này để chúng ta có thể tiếp tục xây dựng ngôi nhà thân yêu của mình...',
                'On aurait dû l’écouter.. Oui, on aurait dû écouter  les voix que tu disais entendre…',
                'Je ne t’ai pas cru, et regarde où nous en sommes…',
                'Oh, j’ai si soif que j’en boirais un chaudron magique …',
            ],
        },
        part3: {
            audio: 'audio/halloween-2022/scenario2/part3.mp3',
            text: [
                'Tôi không biết phải làm gì... Biển hoang dã quá! Tôi thấy bạn bị cuốn đi!',
                'Tôi xin lỗi, tôi không thể làm gì được! Tôi rất muốn tham gia cùng bạn...',
                'Tôi cảm nhận được bạn, suốt chặng đường phía Nam, trên một trong những hòn đảo lớn nhất...',
            ],
        },
        part4: {
            audio: 'audio/halloween-2022/scenario2/part4.mp3',
            text: [
                'Salaud ! Je l’aimais ! Tu as voulu te débarrasser de moi !',
                'Khi biển dậy sóng, anh nhân cơ hội ném tôi xuống nước!',
                "Mais le karma t'a rattrapé, la mer t’a punie de ton acte !",
                'Dù sao đi nữa, tôi đã giấu di vật mà bạn vô cùng mong muốn trong một căn nhà gỗ bỏ hoang trên một hòn đảo.',
                'Jamais tu l’aurais trouvé !',
            ],
        },
        part6: {
            audio: 'audio/halloween-2022/scenario2/part6.mp3',
            text: [
                'Nhưng thật là một câu chuyện! Tôi có ấn tượng rằng bạn đã giải quyết được huyền thoại này.',
                'La vérité est bien différente de ce que j’ai pu entendre, oh oh oh.',
                'Cảm ơn bạn rất nhiều vì đã khai sáng cho một ông già. Hãy giữ cái này để đổi lấy!',
                'Chúc may mắn cho các bạn, các bạn trẻ.',
            ],
        },
    },
    zones: [
        {
            name: 'relic',
            part: 5,
            label: 'Chercher',
            icon: 'global/search',
            center: [-2166.59, 5198.18, 16.88],
            length: 0.5,
            width: 0.5,
            heading: 181,
            minZ: 12.48,
            maxZ: 16.48,
        },
    ],
    props: [
        { model: 'prop_hand_toilet', coords: [3739.34, 4903.36, 17.49], rotation: [0, 0, 0] },
        { model: 'prop_water_corpse_01', coords: [2782.97, -1532.91, 0.84], rotation: [-90, -70, 0] },
        { model: 'prop_idol_case', coords: [-2166.61, 5197.96, 15.88], rotation: [0, 0, 0] },
    ],
};
