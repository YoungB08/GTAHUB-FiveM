import { Animation } from '../animation';
import { Component, Prop, WardrobeConfig } from '../cloth';
import { Control } from '../input';
import { joaat } from '../joaat';
import { Vector3, Vector4 } from '../polyzone/vector';

export type KillerVehData = {
    name: string;
    seat: number;
    plate: string;
};

export const bones = {
    52301: 'Bàn chân phải',
    14201: 'Bàn chân trái',
    57005: 'Bàn tay phải',
    18905: 'Bàn tay trái',
    36864: 'Chân phải',
    63931: 'Chân trái',
    31086: 'Đầu',
    39317: 'Cổ / Gáy',
    28252: 'Cánh tay phải',
    61163: 'Cánh tay trái',
    24818: 'Ngực',
    11816: 'Hông / Xương chậu',
    40269: 'Cánh tay phải',
    45509: 'Cánh tay trái',
    28422: 'Cổ tay phải',
    60309: 'Cổ tay trái',
    47495: 'Lưỡi',
    20178: 'Môi trên',
    17188: 'Môi dưới',
    51826: 'Chân phải',
    58217: 'Chân trái',
    64729: 'Vai trái',
    57597: 'Lưng',
    24817: 'Lưng',
    24816: 'Bụng',
    23553: 'Lưng',
    0: 'Ngực',
    20781: 'SKEL_R_Toe0',
    64081: 'SKEL_R_Finger42',
    64080: 'SKEL_R_Finger41',
    58870: 'SKEL_R_Finger40',
    64065: 'SKEL_R_Finger32',
    64064: 'SKEL_R_Finger31',
    58869: 'SKEL_R_Finger30',
    64113: 'SKEL_R_Finger22',
    64112: 'SKEL_R_Finger21',
    58868: 'SKEL_R_Finger20',
    64097: 'SKEL_R_Finger12',
    64096: 'SKEL_R_Finger11',
    58867: 'SKEL_R_Finger10',
    64017: 'SKEL_R_Finger02',
    64016: 'SKEL_R_Finger01',
    58866: 'SKEL_R_Finger00',
    10706: 'Vai phải',
    2108: 'SKEL_L_Toe0',
    58271: 'Chân trái',
    4154: 'SKEL_L_Finger42',
    4153: 'SKEL_L_Finger41',
    26614: 'SKEL_L_Finger40',
    4138: 'SKEL_L_Finger32',
    4137: 'SKEL_L_Finger31',
    26613: 'SKEL_L_Finger30',
    4186: 'SKEL_L_Finger22',
    4185: 'SKEL_L_Finger21',
    26612: 'SKEL_L_Finger20',
    4170: 'SKEL_L_Finger12',
    4169: 'SKEL_L_Finger11',
    26611: 'SKEL_L_Finger10',
    4090: 'SKEL_L_Finger02',
    4089: 'SKEL_L_Finger01',
    26610: 'SKEL_L_Finger00',
    6442: 'RB_R_ThighRoll',
    43810: 'RB_R_ForeArmRoll',
    37119: 'RB_R_ArmRoll',
    35731: 'Đầu',
    23639: 'RB_L_ThighRoll',
    61007: 'RB_L_ForeArmRoll',
    5232: 'RB_L_ArmRoll',
    24806: 'PH_R_Foot',
    57717: 'PH_L_Foot',
    16335: 'Chân phải',
    2992: 'Cánh tay phải',
    46078: 'Chân trái',
    22711: 'Cánh tay trái',
    56604: 'IK_Root',
    6286: 'Bàn tay phải',
    35502: 'IK_R_Foot',
    36029: 'Bàn tay trái',
    65245: 'Bàn chân trái',
    12844: 'Đầu',
    61839: 'FB_UpperLip_000',
    17719: 'FB_R_Lip_Top_000',
    11174: 'FB_R_Lip_Corner_000',
    49979: 'FB_R_Lip_Bot_000',
    43536: 'FB_R_Lid_Upper_000',
    27474: 'Mắt phải',
    19336: 'FB_R_CheekBone_000',
    1356: 'FB_R_Brow_Out_000',
    20623: 'FB_LowerLip_000',
    20279: 'FB_L_Lip_Top_000',
    29868: 'FB_L_Lip_Corner_000',
    47419: 'FB_L_Lip_Bot_000',
    45750: 'FB_L_Lid_Upper_000',
    25260: 'FB_L_Eye_000',
    21550: 'FB_L_CheekBone_000',
    58331: 'FB_L_Brow_Out_000',
    46240: 'Xương hàm',
    37193: 'FB_Brow_Centre_000',
    65068: 'FACIAL_facialRoot',
};

export enum DamageGravity {
    VerySmall = 0,
    Small,
    Medium,
    Heavy,
    Critical,
    Fatal,
}

export type DamageConfig = {
    label: string;
    color: string;
    style: string;
};

export const DamageConfigs: Record<DamageGravity, DamageConfig> = {
    [DamageGravity.VerySmall]: {
        label: 'Rất nhẹ',
        color: '#FFFFFF',
        style: '[box-shadow:_0_1px_12px_rgb(255_255_255)] border-[rgb(255,255,255)] hover:bg-[rgba(255,255,255,0.5)]',
    },
    [DamageGravity.Small]: {
        label: 'Nhẹ',
        color: '#f7e400',
        style: '[box-shadow:_0_1px_12px_rgb(247_248_0)] border-[rgb(247,248,0)] hover:bg-[rgba(247,248,0,0.5)]',
    },
    [DamageGravity.Medium]: {
        label: 'Trung bình',
        color: '#F77800',
        style: '[box-shadow:_0_1px_12px_rgb(247_120_0)] border-[rgb(247,120,0)] hover:bg-[rgba(247,120,0,0.5)]',
    },
    [DamageGravity.Heavy]: {
        label: 'Nặng',
        color: '#d11e1e',
        style: '[box-shadow:_0_1px_12px_rgb(209_30_30)] border-[#d11e1e] hover:bg-[rgba(209,30,30,0.5)]',
    },
    [DamageGravity.Critical]: {
        label: 'Nguy kịch',
        color: '#8D00FA',
        style: '[box-shadow:_0_1px_12px_rgb(141_0_250)] border-[rgb(141,0,250)] hover:bg-[rgba(141,0,250,0.5)]',
    },
    [DamageGravity.Fatal]: {
        label: 'Tử vong',
        color: '#d11e1e',
        style: '[box-shadow:_0_1px_12px_rgb(209_30_30)] border-[#d11e1e] hover:bg-[rgba(209,30,30,0.5)]',
    },
};

export type DamagesType = {
    label: string;
    description: string;
    icon: string;
};

export const DamagesTypes: Record<number, DamagesType> = {
    0: {
        label: 'Vết thương không rõ',
        description: 'Phát hiện tổn thương không rõ nguyên nhân.',
        icon: 'unknown',
    },
    2: {
        label: 'Vết thương va đập',
        description: 'Tổn thương do ngoại lực tác động mạnh hoặc vũ khí cận chiến.',
        icon: 'melee',
    },
    3: {
        label: 'Đạn cỡ nhỏ',
        description:
            'Phát hiện vết thương do đạn cỡ nhỏ từ súng ngắn/SMG. Có thể gây chảy máu, rách mô cơ hoặc tổn thương phần mềm.',
        icon: 'bullet',
    },
    5: {
        label: 'Vết thương do nổ',
        description:
            'Tổn thương do sóng xung kích từ vụ nổ hoặc mảnh văng găm vào cơ thể.',
        icon: 'explosive',
    },
    6: {
        label: 'Bỏng nhiệt / Lửa',
        description:
            'Tổn thương bỏng da và mô do tiếp xúc với lửa hoặc nhiệt độ cực cao.',
        icon: 'fire',
    },
    8: {
        label: 'Chấn thương do ngã',
        description: 'Tổn thương tụ máu, gãy xương do va chạm từ trên cao rơi xuống.',
        icon: 'fall',
    },
    10: {
        label: 'Điện giật',
        icon: 'electrocution',
        description:
            'Dòng điện chạy qua cơ thể gây bỏng da, rối loạn nhịp tim hoặc ngừng tim trong trường hợp nặng.',
    },
    11: {
        label: 'Dây thép gai / Cắt rách',
        icon: 'wire-fence',
        description: 'Nhiều vết rách da liên tiếp đặc trưng do hàng rào dây thép gai, bụi rậm.',
    },
    901: {
        label: 'Mất nước nghiêm trọng',
        icon: 'dehydratation',
        description:
            'Cơ thể bị thiếu hụt nước và khoáng chất trầm trọng, dẫn đến suy kiệt và bất tỉnh.',
    },
    902: {
        label: 'Ngộ độc cồn / Say rượu',
        icon: 'alcohol',
        description: 'Nồng độ cồn trong máu quá cao làm ức chế hệ thần kinh trung ương gây mất ý thức.',
    },
    903: {
        label: 'Sốc ma túy / Quá liều',
        icon: 'overdose',
        description: 'Sử dụng chất kích thích quá liều làm suy tim phổi cấp tính và bất tỉnh.',
    },
    904: {
        label: 'Kiệt sức vì đói',
        icon: 'hunger',
        description:
            'Hạ đường huyết nghiêm trọng dẫn đến suy nhược toàn thân, run rẩy và hôn mê.',
    },
    905: {
        label: 'Chấn thương va chạm mạnh',
        icon: 'choc',
        description:
            'Tụ máu diện rộng do va chạm giao thông hoặc ngoại lực cực mạnh.',
    },
    906: {
        label: 'Ngạt nước / Đuối nước',
        icon: 'drown',
        description: 'Suy hô hấp cấp do nước tràn vào đường thở khi chìm trong chất lỏng.',
    },
    907: {
        label: 'Vết chém / Cắt sâu',
        icon: 'entaille',
        description:
            'Vết thương hở lớn do vũ khí sắc bén gây mất máu ồ ạt.',
    },
    908: {
        label: 'Đòn đánh tay không',
        icon: 'fist',
        description: 'Bầm tím và chấn thương mô mềm do đấm đá bằng tay chân.',
    },
    909: {
        label: 'Đạn cỡ trung bình',
        description:
            'Vết thương do đạn súng trường/Carbine xuyên qua cơ thể gây mất máu nặng.',
        icon: 'bullet2',
    },
    910: {
        label: 'Đạn hạng nặng / Sniper',
        description:
            'Vết đạn phá hủy mô cơ và xương nghiêm trọng, nguy cơ tử vong rất cao.',
        icon: 'bullet3',
    },
    911: {
        label: 'Hạ thân nhiệt / Đóng băng',
        description: 'Tổn thương mô do thời tiết giá lạnh cực độ và hoại tử do băng giá.',
        icon: 'cold',
    },
};

export type DamageData = {
    victimId: string;
    attackerId: number;
    bone: number;
    damageType: number;
    weapon: string;
    damageQty: number;
    isFatal: boolean;
    lastDamage?: number;
};

export type KillData = {
    killerid: number;
    killertype: number;
    killerentitytype: number;
    weaponhash: number;
    weapondamagetype: number;
    weapongroup: number;
    killpos: Vector3;
    killerveh?: KillerVehData;
    ejection: boolean;
    hungerThristDeath: boolean;
    frozenDeath: boolean;
    loginDuration: number;
};

export const PHARMACY_PRICES = {
    tissue: 125,
    antibiotic: 125,
    pommade: 125,
    painkiller: 125,
    antiacide: 125,
    heal: 360,
    health_book: 50,
};

export const BedLocations: Vector4[] = [
    [316.76, -1431.58, 33.43, 140.0],
    [320.59, -1434.79, 33.43, 139.99],
    [324.42, -1438.0, 33.43, 139.99],
    [328.25, -1441.22, 33.43, 140.0],
    [332.08, -1444.43, 33.43, 139.99],
    [335.91, -1447.65, 33.43, 140.0],
    [332.2, -1452.03, 33.43, 319.99],
    [328.18, -1448.66, 33.43, 319.99],
    [324.35, -1445.44, 33.43, 320.0],
    [320.52, -1442.23, 33.43, 319.99],
    [316.69, -1439.01, 33.43, 319.99],
    [312.86, -1435.8, 33.43, 320.0],
];
export function getBedName(index: number) {
    return `UHU_BED_POS_${index}`;
}

export const FailoverLocationName = 'UHU_FAILOVER_LCOCATION';
export const FailoverLocation: Vector4 = [314.35, -1433.47, 32.01, 223.96];

export const PatientClothes: WardrobeConfig = {
    [joaat('mp_m_freemode_01')]: {
        ['Patient']: {
            Components: {
                [Component.Mask]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Torso]: { Drawable: 15, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 61, Texture: 0, Palette: 0 },
                [Component.Bag]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 34, Texture: 0, Palette: 0 },
                [Component.Accessories]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 15, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 7,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {
                [Prop.Hat]: { Clear: true },
                [Prop.Glasses]: { Clear: true },
                [Prop.Ear]: { Clear: true },
                [Prop.LeftHand]: { Clear: true },
                [Prop.RightHand]: { Clear: true },
                [Prop.Helmet]: { Clear: true },
            },
            GlovesID: 0,
        },
    },
    [joaat('mp_f_freemode_01')]: {
        ['Patient']: {
            Components: {
                [Component.Mask]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Torso]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 15, Texture: 3, Palette: 0 },
                [Component.Bag]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 35, Texture: 0, Palette: 0 },
                [Component.Accessories]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 14, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 7,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {
                [Prop.Hat]: { Clear: true },
                [Prop.Glasses]: { Clear: true },
                [Prop.Ear]: { Clear: true },
                [Prop.LeftHand]: { Clear: true },
                [Prop.RightHand]: { Clear: true },
                [Prop.Helmet]: { Clear: true },
            },
            GlovesID: 0,
        },
    },
};

export const DUTY_OUTFIT_NAME = 'Tenue de service';
export const HAZMAT_OUTFIT_NAME = 'Tenue hazmat';

export const LsmcCloakroom: WardrobeConfig = {
    [joaat('mp_m_freemode_01')]: {
        [DUTY_OUTFIT_NAME]: {
            Components: {
                [Component.Torso]: { Drawable: 92, Texture: 0, Palette: 0 },
                [Component.Legs]: {
                    Drawable: 4,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Shoes]: { Drawable: 51, Texture: 0, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 0,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: {
                    Drawable: 5,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 3,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {},
        },
        ['Tenue incendie']: {
            Components: {
                [Component.Torso]: { Drawable: 96, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 120, Texture: 0, Palette: 0 },
                [Component.Bag]: { Drawable: 9, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 24, Texture: 0, Palette: 0 },
                [Component.Accessories]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 151, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 314, Texture: 0, Palette: 0 },
            },
            Props: {
                [Prop.Helmet]: {
                    Drawable: 3,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
        },
        [HAZMAT_OUTFIT_NAME]: {
            Components: {
                [Component.Mask]: { Drawable: 46, Texture: 0, Palette: 0 },
                [Component.Torso]: { Drawable: 86, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 40, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 25, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 62, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 67, Texture: 0, Palette: 0 },
            },
            Props: { [Prop.Hat]: { Clear: true } },
        },
        ['Tenue Hiver']: {
            Components: {
                [Component.Torso]: { Drawable: 90, Texture: 0, Palette: 0 },
                [Component.Legs]: {
                    Drawable: 4,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Shoes]: { Drawable: 51, Texture: 0, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 0,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: { Drawable: 179, Texture: 11, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 6,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {},
        },
        ['Sauveteur en mer']: {
            Components: {
                [Component.Torso]: { Drawable: 15, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 14, Texture: 3, Palette: 0 },
                [Component.Shoes]: { Drawable: 67, Texture: 3, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 5,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: { Drawable: 15, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 15, Texture: 0, Palette: 0 },
            },
            Props: {},
        },
        ['Trauma team']: {
            Components: {
                [Component.Torso]: { Drawable: 4, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 4, Texture: 0, Palette: 0, Collection: 'soz_bcso' },
                [Component.Bag]: { Drawable: 9, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 110, Texture: 3, Palette: 0 },
                [Component.Undershirt]: { Drawable: 15, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 11, Texture: 2, Palette: 0, Collection: 'soz_bcso' },
            },
            Props: {
                [Prop.Helmet]: {
                    Drawable: 125,
                    Texture: 1,
                    Palette: 0,
                },
            },
            GlovesID: 56010,
        },
    },
    [joaat('mp_f_freemode_01')]: {
        [DUTY_OUTFIT_NAME]: {
            Components: {
                [Component.Torso]: { Drawable: 106, Texture: 0, Palette: 0 },
                [Component.Legs]: {
                    Drawable: 4,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Shoes]: { Drawable: 52, Texture: 0, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 0,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: {
                    Drawable: 5,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 3,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {},
        },
        ['Tenue incendie']: {
            Components: {
                [Component.Torso]: { Drawable: 111, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 126, Texture: 0, Palette: 0 },
                [Component.Bag]: { Drawable: 9, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 24, Texture: 0, Palette: 0 },
                [Component.Accessories]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 187, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 325, Texture: 0, Palette: 0 },
            },
            Props: {
                [Prop.Helmet]: {
                    Drawable: 3,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
        },
        [HAZMAT_OUTFIT_NAME]: {
            Components: {
                [Component.Mask]: { Drawable: 46, Texture: 0, Palette: 0 },
                [Component.Torso]: { Drawable: 101, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 40, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 25, Texture: 0, Palette: 0 },
                [Component.Undershirt]: { Drawable: 43, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 61, Texture: 0, Palette: 0 },
            },
            Props: { [0]: { Clear: true } },
        },
        ['Tenue Hiver']: {
            Components: {
                [Component.Torso]: { Drawable: 106, Texture: 0, Palette: 0 },
                [Component.Legs]: {
                    Drawable: 4,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Shoes]: { Drawable: 52, Texture: 0, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 0,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: { Drawable: 217, Texture: 11, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 6,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {},
        },
        ['Sauveteur en mer']: {
            Components: {
                [Component.Torso]: { Drawable: 11, Texture: 0, Palette: 0 },
                [Component.Legs]: {
                    Drawable: 11,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Shoes]: { Drawable: 70, Texture: 0, Palette: 0 },
                [Component.Accessories]: {
                    Drawable: 5,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
                [Component.Undershirt]: { Drawable: 14, Texture: 0, Palette: 0 },
                [Component.BodyArmor]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: {
                    Drawable: 13,
                    Texture: 0,
                    Palette: 0,
                    Collection: 'soz_bcso',
                },
            },
            Props: {},
        },
        ['Trauma team']: {
            Components: {
                [Component.Torso]: { Drawable: 3, Texture: 0, Palette: 0 },
                [Component.Legs]: { Drawable: 4, Texture: 0, Palette: 0, Collection: 'soz_bcso' },
                [Component.Bag]: { Drawable: 9, Texture: 0, Palette: 0 },
                [Component.Shoes]: { Drawable: 115, Texture: 3, Palette: 0 },
                [Component.Undershirt]: { Drawable: 14, Texture: 0, Palette: 0 },
                [Component.Decals]: { Drawable: 0, Texture: 0, Palette: 0 },
                [Component.Tops]: { Drawable: 11, Texture: 2, Palette: 0, Collection: 'soz_bcso' },
            },
            Props: {
                [Prop.Helmet]: {
                    Drawable: 124,
                    Texture: 1,
                    Palette: 0,
                },
            },
            GlovesID: 55010,
        },
    },
};

export const LSMCConfig = {
    scanTime: 10000,
};

export type DamageServerData = {
    citizenid: string;
    attackerId: string;
    bone: number;
    damageType: number;
    weapon: string;
    damageQty: number;
    isFatal: boolean;
    date: number;
};

export const WheelChairModel = joaat('prop_wheelchair_01');
export const StretcherModel = joaat('fernocot');
export const StretcherFoldedModel = joaat('loweredfernocot');
export const deathAnim: Animation = {
    base: {
        dictionary: 'dead',
        name: 'dead_a',
        blendInSpeed: 8.0,
        blendOutSpeed: 8.0,
        options: {
            repeat: true,
        },
    },
};

export enum PlasterLocation {
    //LeftArm = 'left_arm',
    //RightArm = 'right_arm',
    LeftFeet = 'left_feet',
    RightFeet = 'right_feet',
    LeftHand = 'left_hand',
    RighHand = 'right_hand',
    Neck = 'neck',
}

export type PlasterConfig = {
    label: string;
    bone: number;
    prop: Record<number, string>;
    position: Vector3;
    rotation: Vector3;
    blockedAction: Control[];
};

export const PlasterConfigs: Record<PlasterLocation, PlasterConfig> = {
    /*
    [PlasterLocation.LeftArm]: {
        label: 'Bras Gauche',
        bone: 22711,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_a_l_h',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_a_l_f',
        },
        position: [0.0, 0.0, 0.0],
        rotation: [0.0, 0.0, 0.0],
    },
    [PlasterLocation.RightArm]: {
        label: 'Bras Droit',
        bone: 2992,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_a_r_h',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_a_r_f',
        },
        position: [0.0, 0.0, 0.0],
        rotation: [0.0, 0.0, 0.0],
    },*/
    [PlasterLocation.LeftFeet]: {
        label: 'Bàn chân trái',
        bone: 14201,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_f_l',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_f_l',
        },
        position: [0.1, 0.1, 0.01],
        rotation: [0.0, 5.0, -75.0],
        blockedAction: [
            Control.Sprint,
            Control.Jump,

            Control.VehicleAccelerate,
            Control.VehicleBrake,
            Control.VehicleFlyThrottleUp,
            Control.VehicleFlyThrottleDown,
        ],
    },
    [PlasterLocation.RightFeet]: {
        label: 'Bàn chân phải',
        bone: 36864,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_f_r',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_f_r',
        },
        position: [0.32, 0.13, 0.0],
        rotation: [0.0, 0.0, 8.0],
        blockedAction: [
            Control.Sprint,
            Control.Jump,

            Control.VehicleAccelerate,
            Control.VehicleBrake,
            Control.VehicleFlyThrottleUp,
            Control.VehicleFlyThrottleDown,
        ],
    },
    [PlasterLocation.LeftHand]: {
        label: 'Bàn tay trái',
        bone: 61163,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_h_l',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_h_l',
        },
        position: [0.25, 0.0, 0.0],
        rotation: [180.0, 0.0, 0.0],
        blockedAction: [
            Control.Attack,
            Control.Attack2,
            Control.Aim,
            Control.MeleeAttackLight,
            Control.MeleeAttackHeavy,
            Control.MeleeAttackAlternate,
            Control.MeleeAttackLight,
            Control.MeleeBlock,
            Control.MeleeAttack2,
        ],
    },
    [PlasterLocation.RighHand]: {
        label: 'Bàn tay phải',
        bone: 28252,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_h_r',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_h_r',
        },
        position: [0.27, 0.0, 0.0],
        rotation: [180.0, 0.0, 0.0],
        blockedAction: [
            Control.Attack,
            Control.Attack2,
            Control.Aim,
            Control.MeleeAttackLight,
            Control.MeleeAttackHeavy,
            Control.MeleeAttackAlternate,
            Control.MeleeAttackLight,
            Control.MeleeBlock,
            Control.MeleeAttack2,
        ],
    },
    [PlasterLocation.Neck]: {
        label: 'Vùng cổ (Nẹp cố định)',
        bone: 39317,
        prop: {
            [joaat('mp_m_freemode_01')]: 'soz_med_plaster_n',
            [joaat('mp_f_freemode_01')]: 'soz_med_plaster_n',
        },
        position: [0.08, 0.0, 0.0],
        rotation: [0.0, 0.0, 180.0],
        blockedAction: [],
    },
};

export type PlasterMenuData = {
    locations: PlasterLocation[];
    playerServerId: number;
};
