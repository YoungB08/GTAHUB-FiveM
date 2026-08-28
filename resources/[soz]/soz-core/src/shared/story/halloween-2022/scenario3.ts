import { Story } from '../story';

export const Halloween2022Scenario3EnterBunker = 'Halloween2022Scenario3EnterBunker';
export const Halloween2022Scenario3ExitBunker = 'Halloween2022Scenario3ExitBunker';

export const Halloween2022Scenario3: Story = {
    name: 'La double personnalité',
    dialog: {
        part1: {
            audio: 'audio/halloween-2022/scenario3/part1.mp3',
            text: [
                'Mais où est-ce qu’elle est tombée ?',
                'Tôi quay đầu lại trong giây lát muốn chụp ảnh người ngoài hành tinh, nhưng ở đó tôi chỉ có một mình!',
                'Bạn có thể đi kiểm tra phía dưới vách đá này xem bạn tôi có ở đó không?',
                'Chúng tôi đang chụp ảnh giữa giiiirrrlll thì cô ấy đột nhiên biến mất!',
                'Je crains qu’elle soit malheureusement tombée…',
            ],
        },
        part2: {
            audio: 'audio/halloween-2022/scenario3/part2.mp3',
            text: [
                'Aaaaah… Tay tôi đau quá… Ôi, ai đó! Bạn nói bạn đến đây là nhờ bạn tôi?',
                'Thật không thể tin được, bạn sẽ cứu tôi! Tôi bị gãy tay khi rơi khỏi vách đá!',
                'Nó xảy ra quá nhanh, tôi nhìn thấy một người ngoài hành tinh xinh đẹp ở đằng xa, và bùm, không còn ký ức nữa!',
                'L’alien m’a aidé et m’a installé sur ce lit, je ne sais pas trop où je suis.',
                'Il disait qu’il allait devoir me couper la main, la recoudre, bref…',
                "J’ai cru entendre qu'il devait aller au Wenger Institute !",
                'Hãy làm gì đó đi, làm ơn!',
            ],
        },
        part3: {
            audio: 'audio/halloween-2022/scenario3/part3.mp3',
            text: [
                'Mmmh? Bạn đang nói gì với tôi vậy?...',
                'Quả thực có một người ngoài hành tinh giống với mô tả của bạn đã đi qua đây.',
                'Anh ấy nhờ tôi giúp một tay để giúp đỡ một người phụ nữ mà anh ấy tìm thấy trên mặt đất.',
                'Tôi không hiểu hết mọi chuyện, anh ấy bỏ đi trước khi tôi kịp trả lời.',
                'Hãy cầm lấy cái này, có thể nó sẽ giúp ích cho bạn. Nhưng hãy ra ngoài ngay!',
            ],
        },
        part4: {
            audio: 'audio/halloween-2022/scenario3/part4.mp3',
            text: [
                'Ôi thật không thể tin được! Bàn tay bạn dán lại cho tôi thật hoàn hảo!',
                'Tôi có thể sử dụng nó một lần nữa. Cảm ơn bạn rất nhiều vì sự giúp đỡ của bạn!',
                "Sẽ là khôn ngoan nếu cảnh báo bạn tôi, cô ấy chắc chắn đang đợi tôi, lo lắng đến chết mất!",
                'Oooh où est ton mon bel alien, j’aimerais tant revoir mon véritable sauveur.',
            ],
        },
        part5: {
            audio: 'audio/halloween-2022/scenario3/part5.mp3',
            text: [
                'Xin thứ lỗi ? Bạn đã dán tay anh ấy lại với nhau à?! Và hơn thế nữa, cô ấy đã tìm thấy một người ngoài hành tinh?!',
                'Không, nhưng thật là một người kinh tởm khi sống một mình trong cuộc phiêu lưu của mình! Bạn đang nói về một người bạn.',
                'Pfff, chờ đã, bạn vẫn đồng ý giúp tôi. Cảm ơn bạn rất nhiều.',
            ],
        },
    },
    props: [
        { model: 'p_bloodsplat_s', coords: [594.75, 5552.92, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [597.65, 5553.05, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [600.25, 5551.26, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [602.78, 5553.44, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [602.26, 5556.87, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [603.01, 5559.93, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [600.63, 5561.16, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [597.86, 5563.14, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [595.08, 5560.92, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [592.68, 5559.43, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [593.48, 5555.8, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [592.93, 5552.86, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [599.03, 5559.13, 715.76], rotation: [-90, 0, 0] },
        { model: 'p_bloodsplat_s', coords: [596.55, 5556.69, 715.76], rotation: [-90, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [595.67, 5554.19, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [595.76, 5557.66, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [599.34, 5561.47, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [601.29, 5558.84, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [604.25, 5558.55, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [600.95, 5554.34, 715.76], rotation: [0, 0, 0] },
        { model: 'v_ilev_body_parts', coords: [596.7, 5551.71, 715.76], rotation: [0, 0, 0] },
    ],
};
