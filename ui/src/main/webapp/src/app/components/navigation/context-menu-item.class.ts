import {ApplicationGroup} from "windup-services";
import {RouteLinkProviderService} from "../../services/route-link-provider-service";
import {WindupExecution} from "windup-services";

export interface ContextMenuItemInterface {
    label: string;
    link: string|Function;
    icon: string;
    isEnabled: boolean;
    action?: Function;
    data?: any;
}

export class ContextMenuItem implements ContextMenuItemInterface {
    protected _label: string;
    protected _link: string;
    protected _icon: string;
    protected _isEnabled: boolean | Function;
    protected _action?: Function;
    protected _data?: any;

    constructor(label: string, icon: string, isEnabled?: boolean | Function, link?: string, action?:Function, data?: any) {
        this._label = label;
        this._link = link;
        this._icon = icon;
        this._isEnabled = isEnabled;
        this._action = action;
        this._data = data;
    }

    get label(): string {
        return this._label;
    }

    get link(): string {
        return this._link;
    }

    get icon(): string {
        return this._icon;
    }

    get isEnabled(): boolean {
        if (this._isEnabled instanceof Function)
            return <boolean>this._isEnabled();
        else
            return <boolean>this._isEnabled;
    }

    get action(): Function {
        return this._action;
    }

    get data():any {
        return this._data;
    }
}

export class ReportMenuItem extends ContextMenuItem {
    protected applicationGroup: ApplicationGroup;
    protected component: any;

    constructor(label: string, icon: string, applicationGroup: ApplicationGroup, component,
                protected _routeLinkProviderService: RouteLinkProviderService
    ) {
        super(label, icon);
        this.component = component;
        this.applicationGroup = applicationGroup;
    }

    get link(): string {
        let execution = this.getLastCompletedExecution();

        return this._routeLinkProviderService.getRouteForComponent(this.component, {
            groupId: this.applicationGroup.id,
            executionId: execution.id,
            projectId: this.applicationGroup.migrationProject.id,
        });
    }

    get isEnabled(): boolean {
        let execution = this.getLastCompletedExecution();
        return <boolean><any>(this.applicationGroup && this.applicationGroup.id && execution && execution.id);
    }

    protected getLastCompletedExecution(): WindupExecution {
        let startedExecutions = this.applicationGroup.executions.filter(execution => execution.state === "STARTED" || execution.state === "COMPLETED");

        let lastExecution:WindupExecution = null;
        startedExecutions.forEach((execution) => {
            if (lastExecution == null)
                lastExecution = execution;
            else if (execution.timeStarted > lastExecution.timeStarted)
                lastExecution = execution;
        });

        return lastExecution;
    }
}
