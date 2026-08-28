import { fetchNui } from '@public/nui/fetch';
import { useRepository } from '@public/nui/hook/repository';
import { NuiEvent } from '@public/shared/event/nui';
import { JobType } from '@public/shared/job';
import { JobRegistry } from '@public/shared/job/config';
import { AskInput } from '@public/shared/nui/input';
import { RepositoryType } from '@public/shared/repository';
import { FunctionComponent } from 'react';

import { defaultDrawDistance, defaultInteractionDistance } from '../../../shared/interaction';
import { MenuType } from '../../../shared/nui/menu';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type DoorMenuStateProps = {
    data: string;
};

export const DoorGangSubMenu: FunctionComponent<DoorMenuStateProps> = ({ data }) => {
    const doors = useRepository(RepositoryType.Door);
    const gangs = useRepository(RepositoryType.Gang);

    const door = doors[data];

    if (!doors || !gangs) {
        return;
    }

    return (
        <SubMenu id="gang">
            <MenuTitle title="Cửa" />
            <MenuContent subtitle="Quản lý Băng đảng">
                <MenuItemSelect
                    title="Thêm Băng đảng"
                    onConfirm={async (index, gangId) => {
                        door.gangs.push(gangId);
                        fetchNui(NuiEvent.AdminDoorSetState, door);
                    }}
                >
                    {Object.values(gangs).map(gang => {
                        return (
                            <MenuItemSelectOption value={gang.id} key={'gang_' + gang.id}>
                                {gang.name}
                            </MenuItemSelectOption>
                        );
                    })}
                </MenuItemSelect>
                {door.gangs &&
                    door.gangs.map((gangId, index) => {
                        const gang = Object.values(gangs).find(gang => gang.id == gangId);
                        return (
                            <MenuItemButton
                                onConfirm={async () => {
                                    door.gangs.splice(index, 1);
                                    fetchNui(NuiEvent.AdminDoorSetState, door);
                                }}
                                key={'DoorGangSubMenu' + index}
                            >
                                Xóa {gang?.name || gangId}
                            </MenuItemButton>
                        );
                    })}
            </MenuContent>
        </SubMenu>
    );
};

export const DoorJobSubMenu: FunctionComponent<DoorMenuStateProps> = ({ data }) => {
    const jobIds = Object.keys(JobRegistry) as JobType[];
    const doors = useRepository(RepositoryType.Door);
    const door = doors[data];

    if (!door) {
        return null;
    }

    return (
        <SubMenu id="job">
            <MenuTitle title="Cửa" />
            <MenuContent subtitle="Quản lý Nghề nghiệp">
                <MenuItemSelect
                    title="Thêm Nghề nghiệp"
                    onConfirm={async (index, jobId) => {
                        door.jobs.push(jobId);
                        fetchNui(NuiEvent.AdminDoorSetState, door);
                    }}
                >
                    {jobIds.map(jobId => {
                        const job = JobRegistry[jobId];

                        return (
                            <MenuItemSelectOption value={jobId} key={'job_' + jobId}>
                                {job.label}
                            </MenuItemSelectOption>
                        );
                    })}
                </MenuItemSelect>
                {door.jobs &&
                    door.jobs.map((job, index) => {
                        return (
                            <MenuItemButton
                                onConfirm={async () => {
                                    door.jobs.splice(index, 1);
                                    fetchNui(NuiEvent.AdminDoorSetState, door);
                                }}
                                key={'DoorJobSubMenu' + index}
                            >
                                Xóa {JobRegistry[job]?.label || job}
                            </MenuItemButton>
                        );
                    })}
            </MenuContent>
        </SubMenu>
    );
};

export const DoorKeySubMenu: FunctionComponent<DoorMenuStateProps> = ({ data }) => {
    const doors = useRepository(RepositoryType.Door);
    const door = doors[data];

    if (!door) {
        return null;
    }

    return (
        <SubMenu id="key">
            <MenuTitle title="Cửa" />
            <MenuContent subtitle="Quản lý Chìa khóa">
                <MenuItemButton
                    onConfirm={async () => {
                        const inputData: AskInput = {
                            title: 'Mã chìa khóa',
                        };
                        fetchNui<any, string>(NuiEvent.AskInput, inputData).then(async input => {
                            door.keyMetadata.push(input);
                            await fetchNui(NuiEvent.AdminDoorSetState, door);
                        });
                    }}
                >
                    Thêm mã chìa khóa
                </MenuItemButton>
                {door.keyMetadata &&
                    door.keyMetadata.map((key, index) => {
                        return (
                            <MenuItemButton
                                onConfirm={async () => {
                                    door.keyMetadata.splice(index, 1);
                                    fetchNui(NuiEvent.AdminDoorSetState, door);
                                }}
                                key={'DoorKeySubMenu' + index}
                            >
                                Xóa {key}
                            </MenuItemButton>
                        );
                    })}
            </MenuContent>
        </SubMenu>
    );
};

export const DoorAdminMenu: FunctionComponent<DoorMenuStateProps> = ({ data }) => {
    const doors = useRepository(RepositoryType.Door);
    const door = doors[data];

    if (!door) {
        return null;
    }

    return (
        <Menu type={MenuType.DoorAdmin}>
            <MainMenu>
                <MenuTitle title="Quản lý Cửa" />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={door.lock}
                        onChange={async value => {
                            door.lock = value;
                            fetchNui(NuiEvent.AdminDoorSetState, door);
                        }}
                    >
                        Đang khóa
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={door.holdOpen}
                        onChange={async value => {
                            door.holdOpen = value;
                            fetchNui(NuiEvent.AdminDoorSetState, door);
                        }}
                    >
                        Luôn giữ mở
                    </MenuItemCheckbox>
                    <MenuItemButton
                        onConfirm={async () => {
                            fetchNui(NuiEvent.AdminDoorAddSub, door.id);
                        }}
                    >
                        Thêm cánh cửa phụ (Double door)
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            fetchNui(NuiEvent.AdminDoorDelete, door.id);
                        }}
                    >
                        Xóa cánh cửa này
                    </MenuItemButton>

                    <MenuSubTitle>Tương tác</MenuSubTitle>
                    <MenuItemButton
                        onConfirm={async () => {
                            fetchNui(NuiEvent.AdminDoorSetTarget, { id: door.id, type: 'draw' });
                        }}
                    >
                        <div className="pr-2 flex items-center justify-between">
                            <span>Chỉnh khoảng cách hiển thị</span>
                            <span>{door.target?.draw || defaultDrawDistance}</span>
                        </div>
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            fetchNui(NuiEvent.AdminDoorSetTarget, { id: door.id, type: 'interaction' });
                        }}
                    >
                        <div className="pr-2 flex items-center justify-between">
                            <span>Chỉnh khoảng cách tương tác</span>
                            <span>{door.target?.interaction || defaultInteractionDistance}</span>
                        </div>
                    </MenuItemButton>

                    <MenuSubTitle>Phân quyền mở cửa</MenuSubTitle>
                    <MenuItemSubMenuLink id="gang">Băng đảng</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="job">Nghề nghiệp</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="key">Chìa khóa</MenuItemSubMenuLink>
                </MenuContent>
            </MainMenu>
            <DoorGangSubMenu data={data} />
            <DoorJobSubMenu data={data} />
            <DoorKeySubMenu data={data} />
        </Menu>
    );
};
