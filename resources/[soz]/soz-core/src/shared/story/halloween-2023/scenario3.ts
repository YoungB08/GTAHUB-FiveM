import { BoxZone } from '@public/shared/polyzone/box.zone';

import { Story } from '../story';

export const Halloween2023Scenario3TPWhiteBox = 'Halloween2023Scenario3TPWhiteBox';
export const Halloween2023Scenario3TPHangar = 'Halloween2023Scenario3TPHangar';
export const Halloween2023Scenario3TPBureau = 'Halloween2023Scenario3TPBureau';
export const Halloween2023Scenario3TPFBI = 'Halloween2023Scenario3TPFBI';
export const Halloween2023Scenario3TPAvion = 'Halloween2023Scenario3TPAvion';
export const Halloween2023Scenario3TPGarage = 'Halloween2023Scenario3TPGarage';
export const Halloween2023Scenario3TPFalling = 'Halloween2023Scenario3TPFalling';
export const Halloween2023Scenario3TPSubmarine = 'Halloween2023Scenario3TPSubmarine';
export const Halloween2023Scenario3TPBack = 'Halloween2023Scenario3TPBack';

export const Halloween2023Scenario3: Story = {
    name: 'Le visiteur',
    dialog: {
        part1: {
            audio: 'audio/halloween-2023/scenario3/part1.mp3',
            text: [
                'Oh bonsoir Terrien ! La vue est magnifique, n’est-ce pas ?!',
                'Tu dois être bien surpris de m’entendre parler ta langue,',
                'nhưng hãy nhớ rằng, đây không phải lần đầu tiên tôi đến đây!',
                'Đó không phải là phong tục chào đón khách đúng cách sao?',
                'bằng cách phục vụ anh ta một trong những kỳ quan ẩm thực địa phương?',
                'J’ai entendu parler d’un certain « The Beef with the Bone !”,',
                'qui serait un Hamburger Géant !',
                'Va donc m’en rapporter un, veux-tu bien terrien ?',
            ],
            timing: [3500, 2500, 2500, 2500, 3000, 3000, 2000, 2000],
        },
        part2: {
            audio: 'audio/halloween-2023/scenario3/part2.mp3',
            text: [
                'Nhưng nó rất ngon! Ồ, thật vui khi được khám phá văn hóa địa phương của bạn…',
                'Ecoute, j’ai cru comprendre que tu cherchais à expliquer les phénomènes récents',
                'et je peux sûrement t’aider.',
                'J’ai sur moi un appareil qui me permet de me téléporter.',
                'Nếu bạn muốn, tôi có thể cố gắng giúp bạn bằng cách dịch chuyển bạn vào một tàu ngầm nguyên tử.',
                'Bạn nên tìm ở đó một tài liệu sẽ giúp bạn tìm hiểu thêm về câu chuyện này.',
                'Tôi chỉ hỏi bạn một chút thôi, tôi có một vài điều chỉnh cần thực hiện và chúng ta có thể đi!',
                'Assure toi d’avoir à boire et à manger, ça risque d’être un peu long.',
            ],
            timing: [4500, 3750, 1000, 3250, 4500, 4250, 4500, 3250],
        },
    },
    props: [
        {
            model: 'm23_1_prop_m31_casefile_01a',
            coords: [1561.234130859375, 385.1648864746094, -49.838191986083984],
            rotation: [0, 0, 180],
        },
    ],
    zones: [
        {
            name: 'halloween_2023_scenario3_document',
            part: 4,
            label: 'Ramasser',
            icon: 'global/search',
            ...new BoxZone([1561.1, 385.16, -50.69], 0.4, 0.6, {
                heading: 357.32,
                minZ: -50.09,
                maxZ: -49.69,
            }),
        },
    ],
};
