import _ from 'lodash';
import { Fragment, FunctionComponent, JSXElementConstructor, ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Animations, Moods, Walks } from '../../../config/animation';
import { AnimationConfigItem, AnimationConfigList, WalkConfigItem } from '../../../shared/animation';
import { NuiEvent } from '../../../shared/event';
import { JobPermission } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { JobMenuData, PlayerPersonalMenuData, Shortcut } from '../../../shared/nui/player';
import { fetchNui } from '../../fetch';
import { usePlayer } from '../../hook/data';
import { useJobGrades } from '../../hook/job';
import { useNuiEvent } from '../../hook/nui';
import { RootState } from '../../store';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemStringInput,
    MenuItemSubMenuLink,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type MenuPlayerPersonalProps = {
    data: PlayerPersonalMenuData;
};

export const MenuPlayerPersonal: FunctionComponent<MenuPlayerPersonalProps> = ({ data }) => {
    const player = usePlayer();
    const isHalloween = useSelector((state: RootState) => state.features.Halloween);
    const isWhatIf2 = useSelector((state: RootState) => state.features.WhatIfSecondEpisode);

    if (!player) {
        return null;
    }

    return (
        <Menu type={MenuType.PlayerPersonal}>
            <MainMenu>
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle={`${player.charinfo.firstname} ${player.charinfo.lastname}`}>
                    {data.deguisement && (
                        <MenuItemButton onConfirm={() => fetchNui(NuiEvent.PlayerMenuRemoveDeguisement)}>
                            Tháo đồ cải trang
                        </MenuItemButton>
                    )}
                    {data.naked && (
                        <MenuItemButton onConfirm={() => fetchNui(NuiEvent.PlayerMenuReDress)}>
                            Mặc lại quần áo
                        </MenuItemButton>
                    )}

                    <MenuItemSubMenuLink id="animations">Hành động & Cảm xúc</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="hud">Giao diện (HUD)</MenuItemSubMenuLink>
                    {data.job.enabled && <MenuItemSubMenuLink id="job">Quản lý nghề nghiệp</MenuItemSubMenuLink>}
                    <MenuItemSubMenuLink id="voip">Voice Chat & Màn hình</MenuItemSubMenuLink>
                    {isHalloween && (
                        <MenuItemCheckbox
                            checked={data.arachnophobe}
                            onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetArachnophobe, value)}
                        >
                            Chế độ chống sợ nhện
                        </MenuItemCheckbox>
                    )}
                    {isWhatIf2 && player.metadata.hazmat && (
                        <MenuItemButton
                            description="⚠️ Thao tác này cũng sẽ tháo áo giáp chống đạn đang mặc"
                            onConfirm={() => fetchNui(NuiEvent.PlayerMenuWhatIfRemoveHazmat)}
                        >
                            Cởi bộ đồ bảo hộ Hazmat
                        </MenuItemButton>
                    )}
                    {isWhatIf2 && (
                        <MenuItemButton
                            description="⚠️ Bạn sẽ mất tất cả vật phẩm nhặt được ngoại trừ búa"
                            onConfirm={() => fetchNui(NuiEvent.PlayerMenuWhatIf2Retrieval)}
                        >
                            Yêu cầu dịch chuyển cứu hộ
                        </MenuItemButton>
                    )}
                </MenuContent>
            </MainMenu>
            <MenuAnimation shortcuts={data.shortcuts} favorites={data.favorites} combatMode={data.combatMode} />
            <SubMenu id="hud">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Cài đặt giao diện HUD">
                    <MenuItemCheckbox
                        checked={data.isHudVisible}
                        description="Bật / Tắt toàn bộ giao diện HUD"
                        onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetGlobal, { value })}
                    >
                        HUD: Toàn bộ
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.isCinematicMode}
                        description="Bật / Tắt viền đen điện ảnh màn hình"
                        onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetCinematicMode, { value })}
                    >
                        HUD: Chế độ Điện ảnh
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.isCinematicCameraActive}
                        description="Bật / Tắt góc quay camera điện ảnh"
                        onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetCinematicCameraActive, { value })}
                    >
                        Camera: Chế độ Điện ảnh
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.scaledNui}
                        description="Tự động co giãn giao diện phù hợp màn hình"
                        onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetScaledNui, { value })}
                    >
                        Tự động co giãn (Scaling NUI)
                    </MenuItemCheckbox>

                    <MenuItemCheckbox
                        checked={data.isGlassmorphismActive}
                        description="Bật hiệu ứng làm mờ kính Glassmorphism Candy Red"
                        onChange={value => fetchNui(NuiEvent.PlayerMenuHudSetGlassmorphism, { value })}
                    >
                        Hiệu ứng kính mờ (Glassmorphism)
                    </MenuItemCheckbox>

                    <MenuItemSelect
                        title="Giới hạn FPS Glassmorphism"
                        value={data.glassmorphismFpsLimit}
                        description="Giới hạn tốc độ khung hình cho hiệu ứng kính mờ"
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.PlayerMenuHudSetGlassmorphismFpsLimit, { value });
                        }}
                    >
                        {[30, 60, 90, 120, 144, 165, 240, 300].map(fps => (
                            <MenuItemSelectOption key={fps} value={fps}>
                                {fps} FPS
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>
                </MenuContent>
            </SubMenu>
            <MenuJob data={data.job} />
            <SubMenu id="voip">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Cài đặt Voice Chat">
                    <MenuItemButton onConfirm={() => fetchNui(NuiEvent.PlayerMenuVoipReset)}>
                        Khởi động lại Voice Chat
                    </MenuItemButton>
                    <MenuItemSelect
                        title="Bộ lọc âm thanh"
                        description="Thay đổi bộ lọc khử tạp âm voice chat"
                        value={data.voipIntent}
                        onChange={async (_, value) => {
                            await fetchNui(NuiEvent.PlayerMenuVoipSetIntent, { value });
                        }}
                    >
                        <MenuItemSelectOption value="speech">Giọng nói</MenuItemSelectOption>
                        <MenuItemSelectOption value="music">Âm nhạc</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        title="Âm lượng TV / Màn hình"
                        value={data.videoVolume}
                        description="Thay đổi âm lượng video phát trên màn hình ngoài phố"
                        onChange={async (_, value) => {
                            await fetchNui(NuiEvent.PlayerMenuSetVideoVolume, { value });
                        }}
                    >
                        {[0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(volume => (
                            <MenuItemSelectOption key={volume} value={volume}>{volume}%</MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>
                </MenuContent>
            </SubMenu>
        </Menu>
    );
};

type MenuAnimationProps = {
    shortcuts: Record<string, Shortcut>;
    favorites: Record<string, Shortcut>;
    combatMode: boolean;
};

const MenuAnimation: FunctionComponent<MenuAnimationProps> = ({
    shortcuts: intialShortcuts,
    favorites: intialFavorites,
    combatMode: initialCombatMode,
}) => {
    const [shortcuts, setShortcuts] = useState(intialShortcuts);
    const [favorites, setFavorites] = useState(intialFavorites);
    const [removeCombatMode, setRemoveCombatMode] = useState(initialCombatMode);

    useNuiEvent('player', 'UpdateAnimationShortcuts', shortcuts => {
        setShortcuts(shortcuts);
    });

    useNuiEvent('player', 'UpdateAnimationFavorites', shortcuts => {
        setFavorites(shortcuts);
    });

    useNuiEvent('player', 'UpdateCombatMode', combatMode => {
        setRemoveCombatMode(combatMode);
    });

    return (
        <>
            <SubMenu id="animations">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Quản lý hành động">
                    <MenuSubTitle>Hành động</MenuSubTitle>
                    <MenuItemSubMenuLink id="animation_list">Danh sách hành động</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="shortcut_list">Phím tắt của tôi</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="favorite_list">Yêu thích của tôi</MenuItemSubMenuLink>

                    <MenuSubTitle>Dáng đi & Cảm xúc</MenuSubTitle>
                    <MenuItemSubMenuLink id="walk_list">Dáng đi</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="mood_list">Biểu cảm khuôn mặt</MenuItemSubMenuLink>
                    <MenuItemCheckbox
                        onChange={value => {
                            fetchNui(NuiEvent.PlayerAnimationUpdateCombatMode, value);
                            setRemoveCombatMode(value);
                        }}
                        checked={removeCombatMode}
                    >
                        Tắt tư thế chiến đấu
                    </MenuItemCheckbox>
                </MenuContent>
            </SubMenu>
            <SubMenu id="mood_list">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Cảm xúc khuôn mặt">
                    {Moods.map((mood, i) => (
                        <MenuItemButton
                            onConfirm={() => {
                                fetchNui(NuiEvent.PlayerMenuAnimationSetMood, { moodItem: mood });
                            }}
                            key={i}
                        >
                            {mood.name}
                        </MenuItemButton>
                    ))}
                </MenuContent>
            </SubMenu>
            <SubMenu id="favorite_list">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Hành động yêu thích">
                    {Object.entries(favorites).map(([key, shortcut]) => {
                        if (!shortcut.animation) {
                            return <MenuItemButton key={key}>{shortcut.name}</MenuItemButton>;
                        }

                        return (
                            <MenuItemSelect
                                title={shortcut.name}
                                onConfirm={(i, value) => {
                                    if (value === 'delete') {
                                        fetchNui(NuiEvent.PlayerMenuAnimationFavoriteDelete, { key });
                                    }
                                    if (value === 'shortcut') {
                                        fetchNui(NuiEvent.PlayerMenuAnimationShortcut, {
                                            animationItem: shortcut.animation,
                                        });
                                    }
                                    if (value === 'play') {
                                        fetchNui(NuiEvent.PlayerMenuAnimationPlay, {
                                            animationItem: shortcut.animation,
                                        });
                                    }
                                }}
                                key={key}
                            >
                                <MenuItemSelectOption value="play">Thực hiện</MenuItemSelectOption>
                                <MenuItemSelectOption value="shortcut">Phím tắt</MenuItemSelectOption>
                                <MenuItemSelectOption value="delete">Xóa bỏ</MenuItemSelectOption>
                            </MenuItemSelect>
                        );
                    })}
                </MenuContent>
            </SubMenu>
            <SubMenu id="shortcut_list">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Phím tắt của tôi">
                    {Object.entries(shortcuts).map(([key, shortcut]) => {
                        if (!shortcut.animation) {
                            return <MenuItemButton key={key}>{shortcut.name}</MenuItemButton>;
                        }

                        return (
                            <MenuItemSelect
                                title={shortcut.name}
                                onConfirm={(i, value) => {
                                    if (value === 'delete') {
                                        fetchNui(NuiEvent.PlayerMenuAnimationShortcutDelete, { key });
                                    }
                                    if (value === 'play') {
                                        fetchNui(NuiEvent.PlayerMenuAnimationPlay, {
                                            animationItem: shortcut.animation,
                                        });
                                    }
                                }}
                                key={key}
                            >
                                <MenuItemSelectOption value="play">Thực hiện</MenuItemSelectOption>
                                <MenuItemSelectOption value="delete">Xóa bỏ</MenuItemSelectOption>
                            </MenuItemSelect>
                        );
                    })}
                </MenuContent>
            </SubMenu>
            <MenuWalkList />
            <MenuAnimationList />
        </>
    );
};

const MenuAnimationList: FunctionComponent = () => {
    const [menuConstructor, setMenuConstructor] = useState<{
        elements: ReactElement<any, string | JSXElementConstructor<any>>[];
        subMenus: ReactElement<any, string | JSXElementConstructor<any>>[];
    }>({
        elements: [],
        subMenus: [],
    });
    const [animations, setAnimations] = useState<AnimationConfigList>([]);
    const [textFilter, setTextFilter] = useState<string>();

    const handleFilter = (value: string) => {
        setTextFilter(value);
    };

    const recursiveFilter = (items: AnimationConfigList, level = 0): AnimationConfigItem[] => {
        const newItems = [];
        for (const item of items) {
            if (['animation', 'event', 'scenario'].includes(item.type)) {
                if (
                    !textFilter ||
                    item.name
                        .toLocaleLowerCase()
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .includes(textFilter.normalize('NFD').replace(/\p{Diacritic}/gu, ''))
                ) {
                    newItems.push(item);
                }
            }

            if (item.type === 'category') {
                if (
                    level === 0 ||
                    !textFilter ||
                    !item.name
                        .toLocaleLowerCase()
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .includes(textFilter.normalize('NFD').replace(/\p{Diacritic}/gu, ''))
                ) {
                    item.items = recursiveFilter(item.items, level + 1);
                }

                if (item.items.length) {
                    newItems.push(item);
                }
            }
        }

        return newItems;
    };

    useEffect(() => {
        const newAnimations = recursiveFilter(_.cloneDeep(Animations));

        setAnimations(newAnimations);
    }, [textFilter]);

    useEffect(() => {
        const elementList = [];
        const subMenuList = [];

        for (const item of animations) {
            const [element, newSubMenus] = createAnimationItemMenu(item, 'animation');

            elementList.push(element);
            subMenuList.push(...newSubMenus);
        }
        setMenuConstructor({
            elements: elementList,
            subMenus: subMenuList,
        });
    }, [animations, setAnimations]);

    return (
        <>
            <SubMenu id="animation_list">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Danh sách hành động">
                    <MenuItemStringInput onChange={handleFilter} value={textFilter}>
                        Tìm kiếm:
                    </MenuItemStringInput>
                    <MenuItemButton
                        onConfirm={() => {
                            fetchNui(NuiEvent.PlayerMenuAnimationStop);
                        }}
                    >
                        🛑 Dừng hành động
                    </MenuItemButton>
                    {menuConstructor.elements.map((element, index) => {
                        return <Fragment key={index}>{element}</Fragment>;
                    })}
                </MenuContent>
            </SubMenu>
            {menuConstructor.subMenus.map((element, index) => {
                return <Fragment key={index}>{element}</Fragment>;
            })}
        </>
    );
};

const MenuWalkList: FunctionComponent = () => {
    const elements = [];
    const subMenus = [];

    for (const item of Walks) {
        const [element, newSubMenus] = createWalkItemMenu(item, 'walk');

        elements.push(element);
        subMenus.push(...newSubMenus);
    }

    return (
        <>
            <SubMenu id="walk_list">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle="Danh sách dáng đi">
                    {elements.map((element, index) => {
                        return <Fragment key={index}>{element}</Fragment>;
                    })}
                </MenuContent>
            </SubMenu>
            {subMenus.map((element, index) => {
                return <Fragment key={index}>{element}</Fragment>;
            })}
        </>
    );
};

type ItemCategory<T> = {
    type: string;
    name: string;
    items?: T[];
};

const createRecursiveSubMenu = <T extends ItemCategory<T>>(
    item: T,
    prefix: string,
    createLeafItem: (item: T) => ReactElement
): [ReactElement, ReactElement[]] => {
    if (item.type !== 'category') {
        return [createLeafItem(item), []];
    }

    if (item.type === 'category') {
        const elements = [];
        const subMenus = [];

        for (const subItem of item.items) {
            const [element, newSubMenus] = createRecursiveSubMenu(subItem, `${prefix}_${item.name}`, createLeafItem);

            elements.push(element);
            subMenus.push(...newSubMenus);
        }

        subMenus.push(
            <SubMenu id={`${prefix}${item.name}`}>
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle={item.name}>
                    {elements.map((element, index) => {
                        return <Fragment key={index}>{element}</Fragment>;
                    })}
                </MenuContent>
            </SubMenu>
        );

        return [<MenuItemSubMenuLink id={`${prefix}${item.name}`}>{item.name}</MenuItemSubMenuLink>, subMenus];
    }

    return [null, []];
};

const createAnimationLeafItem = (item: AnimationConfigItem): ReactElement => {
    if (item.type === 'category') {
        return null;
    }

    return (
        <MenuItemSelect
            onConfirm={(i, value) => {
                if (value === 'play') {
                    fetchNui(NuiEvent.PlayerMenuAnimationPlay, { animationItem: item });
                } else if (value === 'shortcut') {
                    fetchNui(NuiEvent.PlayerMenuAnimationShortcut, {
                        animationItem: item,
                    });
                } else if (value === 'favorite') {
                    fetchNui(NuiEvent.PlayerMenuAnimationFavorite, {
                        animationItem: item,
                    });
                }
            }}
            title={
                <div className="flex items-center">
                    {item.icon && <div className="mr-2">{item.icon}</div>}
                    <div>{item.name}</div>
                </div>
            }
            titleWidth={60}
        >
            <MenuItemSelectOption value="play">Thực hiện</MenuItemSelectOption>
            <MenuItemSelectOption value="shortcut">Phím tắt</MenuItemSelectOption>
            <MenuItemSelectOption value="favorite">Yêu thích</MenuItemSelectOption>
        </MenuItemSelect>
    );
};

const createAnimationItemMenu = (item: AnimationConfigItem, prefix: string): [ReactElement, ReactElement[]] => {
    return createRecursiveSubMenu(item, prefix, createAnimationLeafItem);
};

const createWalkLeafItem = (item: WalkConfigItem): ReactElement => {
    if (item.type === 'category') {
        return null;
    }

    return (
        <MenuItemSelect
            onConfirm={(i, value) => {
                if (value === 'play') {
                    fetchNui(NuiEvent.PlayerMenuAnimationSetWalk, { walkItem: item });
                } else if (value === 'shortcut') {
                    fetchNui(NuiEvent.PlayerMenuAnimationShortcut, {
                        animationItem: item,
                    });
                } else if (value === 'favorite') {
                    fetchNui(NuiEvent.PlayerMenuAnimationFavorite, {
                        animationItem: item,
                    });
                }
            }}
            title={
                <div className="flex items-center">
                    {item.icon && <div className="mr-2">{item.icon}</div>}
                    <div>{item.name}</div>
                </div>
            }
            titleWidth={60}
        >
            <MenuItemSelectOption value="play">Thực hiện</MenuItemSelectOption>
            <MenuItemSelectOption value="shortcut">Phím tắt</MenuItemSelectOption>
            <MenuItemSelectOption value="favorite">Yêu thích</MenuItemSelectOption>
        </MenuItemSelect>
    );
};

const createWalkItemMenu = (item: WalkConfigItem, prefix: string): [ReactElement, ReactElement[]] => {
    return createRecursiveSubMenu(item, prefix, createWalkLeafItem);
};

type MenuJobProps = {
    data: JobMenuData;
};

const MenuJob: FunctionComponent<MenuJobProps> = ({ data }) => {
    const grades = useJobGrades();

    if (!data.enabled) {
        return null;
    }

    const jobGrades = grades.filter(grade => grade.jobId === data.job.id);

    return (
        <>
            <SubMenu id="job">
                <MenuTitle title="Cá nhân" />
                <MenuContent subtitle={`Quản lý nghề nghiệp ${data.job.label}`}>
                    <MenuItemButton
                        onConfirm={() => {
                            fetchNui(NuiEvent.PlayerMenuJobGradeCreate, {
                                job: data.job.id,
                            });
                        }}
                    >
                        Thêm chức vụ mới
                    </MenuItemButton>

                    {jobGrades.map((grade, i) => {
                        return (
                            <MenuItemSubMenuLink key={i} id={`job_grade_${grade.id}`}>
                                {!!grade.owner && '⭐'} {grade.name} {!!grade.is_default && '(mặc định)'}
                            </MenuItemSubMenuLink>
                        );
                    })}
                </MenuContent>
            </SubMenu>
            {jobGrades
                .sort((a, b) => {
                    return b.weight - a.weight;
                })
                .map(grade => {
                    return (
                        <SubMenu id={`job_grade_${grade.id}`} key={`job_grade_${grade.id}`}>
                            <MenuTitle title="Cá nhân" />
                            <MenuContent subtitle={`Quản lý chức vụ ${grade.name}`}>
                                <MenuItemButton
                                    onConfirm={() => {
                                        fetchNui(NuiEvent.PlayerMenuJobGradeUpdateWeight, {
                                            gradeId: grade.id,
                                        });
                                    }}
                                >
                                    Thay đổi cấp bậc ({grade.weight})
                                </MenuItemButton>
                                <MenuItemButton
                                    onConfirm={() => {
                                        fetchNui(NuiEvent.PlayerMenuJobGradeUpdateSalary, {
                                            gradeId: grade.id,
                                        });
                                    }}
                                >
                                    💵 Thay đổi mức lương ({grade.salary}$)
                                </MenuItemButton>
                                {!grade.is_default && (
                                    <MenuItemButton
                                        onConfirm={() => {
                                            fetchNui(NuiEvent.PlayerMenuJobGradeSetDefault, {
                                                gradeId: grade.id,
                                            });
                                        }}
                                    >
                                        Đặt làm chức vụ mặc định
                                    </MenuItemButton>
                                )}
                                <MenuItemButton
                                    onConfirm={() => {
                                        fetchNui(NuiEvent.PlayerMenuJobGradeUpdateName, {
                                            gradeId: grade.id,
                                        });
                                    }}
                                >
                                    ✎ Đổi tên chức vụ
                                </MenuItemButton>
                                <MenuItemButton
                                    onConfirm={() => {
                                        fetchNui(NuiEvent.PlayerMenuJobGradeDelete, {
                                            grade,
                                        });
                                    }}
                                >
                                    ❌ Xóa chức vụ
                                </MenuItemButton>
                                {Object.keys(data.job.permissions).map(permission => {
                                    const permissionValue = data.job.permissions[permission];
                                    const checked = grade.permissions
                                        ? grade.permissions.includes(permission as JobPermission)
                                        : false;

                                    return (
                                        <MenuItemCheckbox
                                            onChange={value => {
                                                fetchNui(NuiEvent.PlayerMenuJobGradePermissionUpdate, {
                                                    gradeId: grade.id,
                                                    permission,
                                                    value,
                                                });
                                            }}
                                            key={permission}
                                            checked={checked}
                                        >
                                            {permissionValue.label}
                                        </MenuItemCheckbox>
                                    );
                                })}
                            </MenuContent>
                        </SubMenu>
                    );
                })}
        </>
    );
};
