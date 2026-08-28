import { SozRole } from '@core/permissions';
import { SubMenuScene } from '@public/nui/components/Menu/SubMenuScene';
import { fetchNui } from '@public/nui/fetch';
import { useItems } from '@public/nui/hook/data';
import { useRepository } from '@public/nui/hook/repository';
import { NuiEvent } from '@public/shared/event/nui';
import { RepositoryType } from '@public/shared/repository';
import { EventInfo } from '@public/shared/scene';
import { Fragment, FunctionComponent, useState } from 'react';

import {
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type EventSubMenuProps = {
    permission: SozRole;
    event: EventInfo;
};

export const EventSubMenu: FunctionComponent<EventSubMenuProps> = ({ permission, event }) => {
    const [eventInfo, setEventInfo] = useState<EventInfo>(event);
    const events = useRepository(RepositoryType.WorldEvent);
    const scenes = useRepository(RepositoryType.Scene);
    const items = useItems();

    const currentEvent = eventInfo.currentEventId
        ? Object.values(events).find(worldEvent => worldEvent.id === eventInfo.currentEventId)
        : null;
    const currentScene = eventInfo.currentSceneId
        ? Object.values(scenes).find(scene => scene.id === eventInfo.currentSceneId)
        : null;

    return (
        <>
            <SubMenu id="event">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Sự kiện Thế giới (World Events)">
                    <MenuItemButton onConfirm={() => fetchNui(NuiEvent.AdminMenuEventCreate)}>
                        📅 Thêm sự kiện mới
                    </MenuItemButton>
                    {currentEvent && currentScene && (
                        <MenuItemButton
                            description={
                                <div>
                                    <div>Sự kiện: {currentEvent.name}</div>
                                    <div>Phân cảnh: {currentScene.name}</div>
                                </div>
                            }
                            onConfirm={() => {
                                fetchNui(NuiEvent.AdminMenuEventStop);
                                setEventInfo({
                                    currentEventId: null,
                                    currentSceneId: null,
                                    startTimestamp: null,
                                    signaledInvs: [],
                                    unlockInvs: [],
                                });
                            }}
                        >
                            🔴 Dừng sự kiện đang chạy
                        </MenuItemButton>
                    )}
                    {Object.values(events).map(event => (
                        <MenuItemSubMenuLink key={event.id} id={`event-${event.id}`}>
                            {event.name}
                        </MenuItemSubMenuLink>
                    ))}
                </MenuContent>
            </SubMenu>
            {Object.values(events).map(event => (
                <Fragment key={event.id}>
                    <SubMenu id={`event-${event.id}`}>
                        <MenuTitle title={permission} />
                        <MenuContent subtitle={`Sự kiện: ${event.name}`}>
                            <MenuItemButton
                                onConfirm={() => fetchNui(NuiEvent.AdminMenuEventAddReward, { eventId: event.id })}
                            >
                                ➕ Thêm phần thưởng
                            </MenuItemButton>
                            <MenuItemButton onConfirm={() => fetchNui(NuiEvent.SceneCreate, { eventId: event.id })}>
                                ➕ Thêm phân cảnh (Scene)
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={() =>
                                    fetchNui(NuiEvent.AdminMenuEventSetStartSound, {
                                        eventId: event.id,
                                        sound: event.startSound,
                                    })
                                }
                            >
                                ➕ Âm thanh mở đầu sự kiện
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={async () => {
                                    const eventInfo = await fetchNui(NuiEvent.AdminMenuEventStart, {
                                        eventId: event.id,
                                    });

                                    if (eventInfo) {
                                        setEventInfo(eventInfo as EventInfo);
                                    }
                                }}
                            >
                                🟢 Bắt đầu sự kiện
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={() => {
                                    fetchNui(NuiEvent.AdminMenuEventDelete, { eventId: event.id });
                                }}
                            >
                                ❌ Xóa sự kiện
                            </MenuItemButton>
                            <MenuSubTitle>Phần thưởng sự kiện</MenuSubTitle>
                            {[
                                ...new Set(
                                    event.reward.map(reward => items.find(item => item.name === reward.item).type)
                                ),
                            ].map(type => (
                                <div key={`reward_${type}`}>
                                    <MenuSubTitle>
                                        <span className="font-normal lowercase">{type}</span>
                                    </MenuSubTitle>

                                    {event.reward
                                        .map((elem, index) => ({ ...elem, index }))
                                        .filter(reward => items.find(item => item.name === reward.item).type == type)
                                        .sort((rewarda, rewardb) =>
                                            items
                                                .find(item => item.name === rewarda.item)
                                                .label.localeCompare(
                                                    items.find(item => item.name === rewardb.item).label
                                                )
                                        )
                                        .map((reward, index) => (
                                            <MenuItemSelect
                                                title={
                                                    items.find(item => item.name === reward.item)?.label || reward.item
                                                }
                                                key={reward.item + index}
                                                description={
                                                    <div>
                                                        <div>Tỷ lệ: {reward.chance}%</div>
                                                        <div>Tối thiểu (Min): {reward.min}</div>
                                                        <div>Tối đa (Max): {reward.max}</div>
                                                    </div>
                                                }
                                                onConfirm={(i, value) => {
                                                    if (value === 'delete') {
                                                        fetchNui(NuiEvent.AdminMenuEventRemoveReward, {
                                                            eventId: event.id,
                                                            index: reward.index,
                                                        });
                                                    }

                                                    if (value === 'chance') {
                                                        fetchNui(NuiEvent.AdminMenuEventSetRewardChance, {
                                                            eventId: event.id,
                                                            index: reward.index,
                                                        });
                                                    }

                                                    if (value === 'min') {
                                                        fetchNui(NuiEvent.AdminMenuEventSetRewardMin, {
                                                            eventId: event.id,
                                                            index: reward.index,
                                                        });
                                                    }

                                                    if (value === 'max') {
                                                        fetchNui(NuiEvent.AdminMenuEventSetRewardMax, {
                                                            eventId: event.id,
                                                            index: reward.index,
                                                        });
                                                    }
                                                }}
                                            >
                                                <MenuItemSelectOption value="delete">Xóa</MenuItemSelectOption>
                                                <MenuItemSelectOption value="chance">Chỉnh Tỷ lệ</MenuItemSelectOption>
                                                <MenuItemSelectOption value="min">Chỉnh Tối thiểu (Min)</MenuItemSelectOption>
                                                <MenuItemSelectOption value="max">Chỉnh Tối đa (Max)</MenuItemSelectOption>
                                            </MenuItemSelect>
                                        ))}
                                </div>
                            ))}
                            <MenuSubTitle>Danh sách Phân cảnh (Scenes)</MenuSubTitle>
                            {Object.values(scenes)
                                .filter(scene => scene.worldEventId === event.id)
                                .map(scene => (
                                    <MenuItemSubMenuLink key={scene.id} id={`scene-${scene.id}`}>
                                        {scene.persistent ? '🟢' : '🔴'} {scene.name}
                                    </MenuItemSubMenuLink>
                                ))}
                        </MenuContent>
                    </SubMenu>
                    {Object.values(scenes)
                        .filter(scene => scene.worldEventId === event.id)
                        .map(scene => (
                            <SubMenuScene key={scene.id} scene={scene} context="admin" allowInventory />
                        ))}
                </Fragment>
            ))}
        </>
    );
};
