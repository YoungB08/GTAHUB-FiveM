import {Spawn} from "../types/spawn";

import SpawnDefault from "../assets/img/default.png"
import SpawnLosSantos from "../assets/img/lossantos.png"
import SpawnPaletoBay from "../assets/img/paletobay.png"

const SpawnList: Spawn[] = [
    {
        identifier: 'default',
        name: 'Chào Mừng Đến Với GTAHUB',
        description: 'Vui lòng chọn 1 trong 2 điểm xuất phát bên dưới để bắt đầu hành trình của bạn!',
        image: SpawnDefault
    },
    {
        identifier: 'spawn1',
        name: 'Thành Phố Los Santos',
        description: 'Khu đô thị sầm uất, trung tâm kinh tế - thương mại và nhộn nhịp nhất San Andreas!',
        image: SpawnLosSantos,
        waypoint: {
            left: '85vw',
            top: '50vh'
        }
    },
    {
        identifier: 'spawn2',
        name: 'Thị Trấn Paleto Bay',
        description: 'Thị trấn ven biển thanh bình phía Bắc, thích hợp nghỉ dưỡng và săn bắn dã ngoại!',
        image: SpawnPaletoBay,
        waypoint: {
            left: '14vw',
            top: '60vh'
        }
    },
]

export default SpawnList
