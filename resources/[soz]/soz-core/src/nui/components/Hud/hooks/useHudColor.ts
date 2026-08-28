import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { HudTheme } from '../../../../shared/hud';
import { useHudTheme } from '../../../hook/data';
import { RootState } from '../../../store';

interface GlassmorphismColors {
    glassmorphismColors: { background: string; border: string };
    gaugeColors: Record<string, string>;
    targetColors: Record<string, string>;
    color: string;
    card: string;
    button: { primary: { background: string; color: string }; secondary: { background: string; color: string } };
    imagePrefix: string;
    isDaltonism: boolean;
}

export const useHudColor = (): GlassmorphismColors => {
    const currentTheme = useHudTheme();

    const isHalloween = useSelector((state: RootState) => state.features.Halloween);
    const halloweenMoon = useSelector((state: RootState) => state.hud.halloween.moon);

    const daltonism = [HudTheme.Trichromatisme, HudTheme.Deuteranopie].includes(currentTheme);

    const _glassmorphismColors: Record<
        Exclude<HudTheme, HudTheme.Auto>,
        { background: string; border: string }
    > = useMemo(() => {
        if (isHalloween) {
            const background = '#00000073';
            const border = '#F0882D';

            return {
                [HudTheme.Light]: { background, border },
                [HudTheme.Dark]: { background, border },
                [HudTheme.Green]: { background, border },
                [HudTheme.Uwu]: { background, border },
                [HudTheme.Deuteranopie]: { background, border },
                [HudTheme.Trichromatisme]: { background, border },
                [HudTheme.HalloweenVein]: { background, border },
                [HudTheme.Gold]: { background, border },
                [HudTheme.Diamond]: { background, border },
            };
        }

        return {
            [HudTheme.Light]: {
                background: '#FFE8ED66',
                border: '#FF1E56',
            },
            [HudTheme.Dark]: {
                background: '#1A040A8A',
                border: '#FF1E56',
            },
            [HudTheme.Green]: {
                background: '#3F7B344D',
                border: '#00E949',
            },
            [HudTheme.Uwu]: {
                background: '#4A08198A',
                border: '#FF4D79',
            },
            [HudTheme.Deuteranopie]: {
                background: '#00000073',
                border: '#FFFFFF',
            },
            [HudTheme.Trichromatisme]: {
                background: '#00000073',
                border: '#FFFFFF',
            },
            [HudTheme.HalloweenVein]: {
                background: '#1A000099',
                border: '#FF1E56',
            },
            [HudTheme.Gold]: {
                background: '#ECDCA74C',
                border: '#ecdca7',
            },
            [HudTheme.Diamond]: {
                background: '#97BCEC4C',
                border: '#97bcf1',
            },
        };
    }, [isHalloween, halloweenMoon]);

    const _colors = useMemo(
        () => ({
            [HudTheme.Light]: '#22232A',
            [HudTheme.Dark]: '#F3FBFA',
            [HudTheme.Green]: '#F3FBFA',
            [HudTheme.Uwu]: '#F3FBFA',
            [HudTheme.Deuteranopie]: '#F3FBFA',
            [HudTheme.Trichromatisme]: '#F3FBFA',
            [HudTheme.HalloweenVein]: '#F3FBFA',
            [HudTheme.Gold]: '#F3FBFA',
            [HudTheme.Diamond]: '#F3FBFA',
        }),
        []
    );

    const _buttons = useMemo(
        () => ({
            [HudTheme.Light]: {
                primary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
                secondary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
            },
            [HudTheme.Dark]: {
                primary: {
                    background: '#FF1E56',
                    color: '#FFFFFF',
                },
                secondary: {
                    background: '#380915',
                    color: '#FFA3B8',
                },
            },
            [HudTheme.Green]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
            },
            [HudTheme.Uwu]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
            },
            [HudTheme.Deuteranopie]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
            },
            [HudTheme.Trichromatisme]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
            },
            [HudTheme.HalloweenVein]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
            },
            [HudTheme.Gold]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
            },
            [HudTheme.Diamond]: {
                primary: {
                    background: '#F3FBFA',
                    color: '#22232A',
                },
                secondary: {
                    background: '#22232A',
                    color: '#F3FBFA',
                },
            },
        }),
        []
    );

    const _cards = useMemo(
        () => ({
            [HudTheme.Light]: '#FFE8ED80',
            [HudTheme.Dark]: '#2B071299',
            [HudTheme.Green]: '#3F7B344D',
            [HudTheme.Uwu]: '#4A08198A',
            [HudTheme.Deuteranopie]: '#4547544D',
            [HudTheme.Trichromatisme]: '#4547544D',
            [HudTheme.HalloweenVein]: '#4547544D',
            [HudTheme.Gold]: '#ECDCA74C',
            [HudTheme.Diamond]: '#B59BEC4C',
        }),
        []
    );

    const _gaugeColors = useMemo(() => {
        if (currentTheme === HudTheme.Deuteranopie) {
            return {
                green_light: '#FFFFFF',
                green_dark: '#000000',
                blue_light: '#B314E8',
                blue_dark: '#000000',
                red_light: '#00FFFF',
                red_dark: '#000000',
                orange_light: '#FFFF00',
                orange_dark: '#000000',
            };
        }

        if (currentTheme === HudTheme.Trichromatisme) {
            return {
                green_light: '#11B916',
                green_dark: '#000000',
                blue_light: '#3E91FF',
                blue_dark: '#000000',
                red_light: '#B314E8',
                red_dark: '#000000',
                orange_light: '#FFFFFF',
                orange_dark: '#000000',
            };
        }

        return {
            green_light: '#329121',
            green_dark: '#283525',
            blue_light: '#00A5E7',
            blue_dark: '#263136',
            red_light: '#92212B',
            red_dark: '#362628',
            orange_light: '#FCAF40',
            orange_dark: '#362F26',
        };
    }, [currentTheme]);

    const _imagePrefix = useMemo(() => {
        if (currentTheme === HudTheme.Deuteranopie) {
            return 'deuteranopie/';
        }
        if (currentTheme === HudTheme.Trichromatisme) {
            return 'trichromatisme/';
        }

        return '';
    }, [currentTheme]);

    return {
        glassmorphismColors: _glassmorphismColors[currentTheme],
        gaugeColors: _gaugeColors,
        targetColors: {
            citizen: daltonism ? '#FFFFFF' : '#FFFFFF',
            society: daltonism ? '#B314E8' : '#0984E3',
            criminal: daltonism ? '#FFFF00' : '#EF4444',
        },
        color: _colors[currentTheme],
        button: _buttons[currentTheme],
        card: _cards[currentTheme],
        imagePrefix: _imagePrefix,
        isDaltonism: daltonism,
    };
};
