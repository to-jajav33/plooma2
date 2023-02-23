import { GetOptionsParams, types } from 'src/boot/StateFactory';
import {uid} from 'quasar';

export class MainState {
    profiles = types.Record({
        nodes: types.Record({htmlText: types.String('')})
    });

    async createProfile(params: GetOptionsParams) {
        const {payload, mutations} = params;
        const {profileName} = payload as {profileName: string};
        const nodeUUID = uid();
        mutations[profileName].set({nodes: {[nodeUUID]: {htmlText: ''}}});
    }
};
