import { BoxZone } from '@public/shared/polyzone/box.zone';

import { Story } from '../story';

export const Halloween2023Scenario4EnterMorgue = 'Halloween2023Scenario4EnterMorgue';
export const Halloween2023Scenario4ExitMorgue = 'Halloween2023Scenario4ExitMorgue';

export const Halloween2023Scenario4EnterCayo = 'Halloween2023Scenario4EnterCayo';
export const Halloween2023Scenario4ExitCayo = 'Halloween2023Scenario4ExitCayo';

export const Halloween2023Scenario4EnterFinal = 'Halloween2023Scenario4EnterFinal';
export const Halloween2023Scenario4ExitFinal = 'Halloween2023Scenario4ExitFinal';

export const Halloween2023Scenario4: Story = {
    name: "L'oeil du diable",
    dialog: {
        part1: {
            audio: 'audio/halloween-2023/scenario4/part1.mp3',
            text: [
                "Thưa các anh chị em, sự xuất hiện của vị thần của chúng ta đã đến! Mắt nhìn thấy mọi thứ!",
                'Hãy dâng mình cho chúa để đạt được địa ngục mà nhiều người mong muốn!',
                'Le corps d’un enfant du Diable nous a été volé et amené à la morgue, récupérez le !',
            ],
            timing: [8500, 5000, 8000],
        },
    },
    zones: [
        {
            name: 'Halloween2023-scenario4-files',
            part: 2,
            label: 'Fouiller',
            icon: 'global/search',
            ...new BoxZone([237.36, -1360.29, 39.53], 1.0, 2.4, {
                heading: 140.6,
                minZ: 38.53,
                maxZ: 40.53,
            }),
        },
    ],
};
