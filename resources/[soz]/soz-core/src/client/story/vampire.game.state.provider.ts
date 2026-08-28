import { Provider } from '@core/decorators/provider';
import { Vector3 } from '@public/shared/polyzone/vector';

import {
    VampireGameAllyRoles,
    VampireGameClientState,
    VampireGameCollection,
    VampireGameEnemyRoles,
    VampireGameObjectiveTypePart2,
    VampireGameRole,
} from '../../shared/halloween';

@Provider()
export class VampireGameStateProvider {
    private state: VampireGameClientState = {
        inWaitingRoom: false,
        started: false,
        role: null,
        objectivePart1: null,
        objectivePart2: null,
    };

    public getCompleteState(state: Partial<VampireGameClientState> = {}) {
        return { ...this.state, ...state };
    }

    public isGameRunning() {
        return this.state.started;
    }

    public isGameStarting() {
        return this.state.inWaitingRoom;
    }

    public setState(state: Partial<VampireGameClientState>) {
        this.state = { ...this.state, ...state };
    }

    public getRole() {
        return this.state.role;
    }

    public hasEnemyRole() {
        return VampireGameEnemyRoles.includes(this.state.role);
    }

    public hasAlliedRole() {
        return VampireGameAllyRoles.includes(this.state.role);
    }

    public hasRole(role: VampireGameRole) {
        return this.state.role === role;
    }

    public getObjectivePart1(): Record<VampireGameCollection, Vector3[]> {
        return this.state.objectivePart1;
    }

    public getObjectivePart2(): Record<VampireGameObjectiveTypePart2, { playerRequired: number; finished: boolean }> {
        return this.state.objectivePart2;
    }

    public getObjectivePart2Instructions(objective: VampireGameObjectiveTypePart2): string[] {
        switch (objective) {
            case 'battery':
                return [
                    'Bạn đang cố gắng khởi động lại pin khẩn cấp của thành phố, nhưng điều đó là cần thiết',
                    `~${this.getObjectivePart2PlayerRequired(objective)} Personnes le fassent en même temps~`,
                    `để làm cho nó hoạt động!`,
                ];
            case 'dam':
                return [
                    'Bạn đang cố gắng khởi động lại con đập của thành phố, nhưng điều đó là cần thiết',
                    `~${this.getObjectivePart2PlayerRequired(objective)} Personnes le fassent en même temps~`,
                    'để làm cho nó hoạt động!',
                ];
            case 'vampire':
                return [
                    'Bạn đang cố gắng tìm hiểu về ma cà rồng, nhưng điều đó là cần thiết.',
                    `~${this.getObjectivePart2PlayerRequired(objective)} Personnes réfléchissent en même temps~`,
                    'để tìm ra giải pháp!',
                ];
            case 'weapon':
                return [
                    'Bạn đang cố gắng rèn vũ khí chống ma cà rồng, nhưng điều đó là cần thiết',
                    `~${this.getObjectivePart2PlayerRequired(objective)} Personnes fondent en même temps~`,
                    'có đủ vũ khí!',
                ];
        }
    }

    public getObjectivePart2PlayerRequired(objective: VampireGameObjectiveTypePart2): number {
        return this.state.objectivePart2?.[objective]?.playerRequired ?? 0;
    }

    public isObjectivePart2Finished(objective: VampireGameObjectiveTypePart2): boolean {
        return this.state.objectivePart2?.[objective]?.finished === true;
    }
}
