import { useAssetPath } from '@public/nui/hook/assets';
import { animated, useTransition } from '@react-spring/web';
import clsx from 'clsx';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { uuidv4 } from '../../../core/utils';
import { JobType } from '../../../shared/job';
import { News } from '../../../shared/news';
import { useNuiEvent } from '../../hook/nui';
import { GlassMorphismContainer } from '../Styleguide/GlassMorphismContainer';

type BannerProps = {
    news: News;
    onDelete: () => void;
};

const Banner: FunctionComponent<BannerProps> = ({ news, onDelete }) => {
    const { getPath } = useAssetPath();

    useEffect(() => {
        const timeoutId = setTimeout(() => onDelete(), 15000);

        return () => clearTimeout(timeoutId);
    }, []);

    const logo = useMemo(() => {
        switch (news.type) {
            case 'lspd':
                return getPath('images/society/lspd.webp');
            case 'bcso':
                return getPath('images/society/bcso.webp');
            case 'fbi':
            case 'fbi_annoncement':
                return getPath('images/society/fbi.webp');
            case 'sasp':
            case 'sasp_annoncement':
                return getPath('images/society/sasp.webp');
            case 'gouv':
                return getPath('images/society/gouv.webp');
            case 'presidence':
                return getPath('images/society/presidence.webp');
            case 'reboot_5':
            case 'reboot_15':
                return getPath('images/hud/weather/day/thunder.webp');
            case 'sandstorm':
                return getPath('images/hud/weather/sandstorm.webp');
            case 'earthquake':
                return getPath('images/hud/weather/earthquake.webp');
            case 'fire':
                return getPath('images/hud/weather/fire.webp');
            case 'flood':
                return getPath('images/hud/weather/day/rain.webp');
            case 'tornado':
                return getPath('images/hud/weather/tornado.webp');
            default:
                if (news.job === JobType.YouNews) {
                    return getPath('images/twitch-news/logo-younews.webp');
                } else {
                    return getPath('images/twitch-news/logo.webp');
                }
        }
    }, [news]);

    const borderColor = useMemo(() => {
        switch (news.type) {
            case 'lspd':
                return '#383AD8';
            case 'bcso':
                return '#83FAAA';
            case 'fbi':
            case 'fbi_annoncement':
                return '#0F538A';
            case 'sasp':
            case 'sasp_annoncement':
                return '#DAB16D';
            case 'gouv':
                return '#0E3FAB';
            case 'presidence':
                return '#EF4444';
            case 'reboot_5':
            case 'reboot_15':
                return '#66BBF4';
            case 'sandstorm':
                return '#DAB16D';
            case 'earthquake':
                return '#DAB16D';
            case 'flood':
                return '#66BBF4';
            case 'fire':
                return '#EF4444';
            case 'tornado':
                return '#88708F';
            default:
                if (news.job === JobType.YouNews) {
                    return '#EF4444';
                } else {
                    return '#6741b1';
                }
        }
    }, [news]);

    const backgroundColor = useMemo(() => {
        switch (news.type) {
            case 'lspd':
                return '#24244273';
            case 'bcso':
                return '#293D3773';
            case 'fbi':
            case 'fbi_annoncement':
                return '#0F538A4D';
            case 'sasp':
            case 'sasp_annoncement':
                return '#5C4B3D73';
            case 'gouv':
                return '#020B1E73';
            case 'presidence':
                return '#1A2E5073';
            case 'reboot_5':
            case 'reboot_15':
                return '#1A2E5073';
            case 'sandstorm':
                return '#5C4B3D73';
            case 'earthquake':
                return '#5C4B3D73';
            case 'flood':
                return '#1A2E5073';
            case 'fire':
                return '#36262873';
            case 'tornado':
                return '#1A2E5073';
            default:
                if (news.job === JobType.YouNews) {
                    return '#36262873';
                } else {
                    return 'rgba(79,54,103,0.45)';
                }
        }
    }, [news]);

    const renderTitle = () => {
        switch (news.type) {
            case 'lspd':
            case 'bcso':
            case 'sasp':
            case 'fbi':
                return 'Lệnh truy nã khẩn cấp';
            case 'fbi_annoncement':
            case 'sasp_annoncement':
            case 'gouv':
            case 'presidence':
                return 'Thông báo chính quyền';
            case 'reboot_5':
            case 'reboot_15':
                return 'Cảnh báo bão lớn (Bảo trì)';
            case 'sandstorm':
                return 'Cảnh báo bão cát';
            case 'earthquake':
                return 'Cảnh báo động đất';
            case 'flood':
                return 'Cảnh báo lũ lụt';
            case 'fire':
                return 'Cảnh báo hỏa hoạn';
            case 'tornado':
                return 'Cảnh báo lốc xoáy';
            default:
                return news.type;
        }
    };

    const renderContent = () => {
        if (news.type.includes('reboot')) {
            return (
                <>
                    <p>
                        Một cơn bão siêu cấp đang tiến vào trung tâm GTAHUB trong vòng{' '}
                        <strong
                            style={{
                                color: borderColor,
                            }}
                        >
                            {news.type.replace('reboot_', '')} Phút
                        </strong>
                        .
                    </p>
                    <p>Vui lòng cất phương tiện vào gara và tìm nơi trú ẩn an toàn!</p>

                    <p className="self-end font-semibold">Trung tâm Khí tượng GTAHUB</p>
                </>
            );
        }

        if (news.type === 'sandstorm') {
            return (
                <>
                    <p>
                        Một đợt bão cát dày đặc đang đổ bộ vào thành phố trong vài phút tới!{' '}
                        <strong
                            className="font-bold"
                            style={{
                                color: borderColor,
                            }}
                        >
                            Vui lòng đeo kính bảo hộ và hạn chế ra đường.
                        </strong>
                    </p>
                    <p>Chú ý quan sát khi lái xe vì tầm nhìn giảm mạnh.</p>
                </>
            );
        }

        if (news.type === 'earthquake') {
            return (
                <>
                    <p>
                        Cảnh báo động đất cường độ lớn có nguy cơ rung chuyển thành phố!{' '}
                        <strong
                            className="font-bold"
                            style={{
                                color: borderColor,
                            }}
                        >
                            Vui lòng di chuyển đến khu vực thoáng đãng, tránh xa các vật dễ cháy nổ.
                        </strong>
                    </p>
                    <p>Giữ bình tĩnh trong suốt thời gian còi báo động vang lên.</p>
                </>
            );
        }

        if (news.type === 'flood') {
            return (
                <>
                    <p>
                        Mưa lớn kéo dài gây ngập úng nghiêm trọng trên diện rộng!{' '}
                        <strong
                            className="font-bold"
                            style={{
                                color: borderColor,
                            }}
                        >
                            Vui lòng tránh xa các khu vực ven sông suối và hầm chui.
                        </strong>
                    </p>
                    <p>Theo dõi sát thông tin cứu hộ từ lực lượng chức năng.</p>
                </>
            );
        }

        if (['lspd', 'bcso', 'sasp', 'fbi'].includes(news.type)) {
            return (
                <>
                    <p>
                        Lực lượng cảnh sát đang khẩn cấp truy tìm đối tượng: <strong>{news.message}</strong>.
                    </p>
                    <p>
                        Nếu có bất kỳ thông tin nào về đối tượng, vui lòng báo ngay qua tổng đài{' '}
                        <strong className="font-bold uppercase">555-{news.type}</strong>.
                    </p>
                </>
            );
        }

        return news.message;
    };

    const notificationSize = {
        'h-[21vh]': window.innerHeight < 1200,
        'h-[17vh]': window.innerHeight > 1200,
    };
    const headerSize = {
        'text-lg': window.innerHeight < 1200,
        'text-2xl': window.innerHeight > 1200,
    };
    const textSize = {
        'text-base': window.innerHeight < 1200,
        'text-xl': window.innerHeight > 1200,
    };

    return (
        <div className={clsx('absolute top-0 overflow-hidden aspect-[600/206] text-white', notificationSize)}>
            <GlassMorphismContainer
                borderClassName="rounded-xl"
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                className="flex gap-3 h-full w-full"
            >
                <div className={clsx('flex flex-col gap-4 grow m-4', textSize)}>
                    <div className="flex gap-6 items-center">
                        {logo && <img className="h-10" src={logo} alt="" />}
                        <h2 className={clsx('font-bold uppercase', headerSize)}>{renderTitle()}</h2>
                    </div>

                    <p className="flex flex-col gap-4 grow">{renderContent()}</p>

                    {news.reporter && <p className="self-end font-bold">{news.reporter}</p>}
                </div>
            </GlassMorphismContainer>
        </div>
    );
};

export const NewsBanner: FunctionComponent = () => {
    const [news, setNews] = useState<News[]>([]);

    useNuiEvent('hud', 'AddNews', news => {
        setNews(n => [
            {
                id: uuidv4(),
                ...news,
            },
            ...n,
        ]);
    });

    const currentNews = useMemo(() => {
        if (news.length < 1) return null;

        return news[news.length - 1];
    }, [news]);

    const deleteNews = useCallback(
        (id: string) => {
            setNews(s => s.filter(n => n.id !== id));
        },
        [setNews]
    );

    const transitions = useTransition(currentNews ? [currentNews] : [], {
        from: {
            opacity: 0,
            top: '-50vh',
        },
        keys: item => item?.id,
        enter: () => async next => {
            await next({
                opacity: 1,
                top: `1vh`,
            });
        },
        leave: [
            {
                opacity: 0,
                top: '-50vh',
            },
        ],
        config: (_item, _index, phase) => key =>
            phase === 'enter' && key === 'life' ? { duration: 3000 } : { tension: 125, friction: 20, precision: 0.1 },
    });

    if (!currentNews) return null;

    return transitions((styles, news) => (
        <animated.div
            key={news.id}
            style={styles}
            className="absolute w-full flex justify-center z-20 pointer-events-none"
        >
            <Banner news={news} onDelete={() => deleteNews(news.id)} />
        </animated.div>
    ));
};
