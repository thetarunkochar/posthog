import { dayjs } from 'lib/dayjs'
import { InsightShortId, PersonType } from '~/types'

export interface ActivityChange {
    type: 'FeatureFlag' | 'Person' | 'Insight' | 'Plugin'
    action: 'changed' | 'created' | 'deleted' | 'exported' | 'split'
    field?: string
    before?: string | Record<string, any> | boolean
    after?: string | Record<string, any> | boolean
}

export interface PersonMerge {
    type: 'Person'
    source: PersonType[]
    target: PersonType
}

export interface Trigger {
    job_type: string
    job_id: string
    payload: Record<string, any>
}

export interface ActivityLogDetail {
    merge: PersonMerge | null
    trigger: Trigger | null
    changes: ActivityChange[] | null
    name: string | null
    short_id?: InsightShortId | null
}

export interface ActivityUser {
    email: string
    first_name: string
}

export enum ActivityScope {
    FEATURE_FLAG = 'FeatureFlag',
    PERSON = 'Person',
    INSIGHT = 'Insight',
    PLUGIN = 'Plugin',
    PLUGIN_CONFIG = 'PluginConfig',
}

export interface ActivityLogItem {
    user: ActivityUser
    activity: string
    created_at: string
    scope: ActivityScope
    item_id?: string
    detail: ActivityLogDetail
    unread?: boolean // when used as a notification
}

// the description of a single activity log is a sentence describing one or more changes that makes up the entry
export type Description = string | JSX.Element | null
// the extended description gives extra context, like the insight details card to describe a change to an insight
export type ExtendedDescription = JSX.Element | undefined
export type ChangeMapping = {
    description: Description[] | null
    extendedDescription?: ExtendedDescription
    suffix?: string | JSX.Element | null // to override the default suffix
}
export type HumanizedChange = { description: Description | null; extendedDescription?: ExtendedDescription }

export interface HumanizedActivityLogItem {
    email?: string
    name?: string
    description: Description
    extendedDescription?: ExtendedDescription // e.g. an insight's filters summary
    created_at: dayjs.Dayjs
    unread?: boolean
}

export type Describer = (logItem: ActivityLogItem, asNotification?: boolean) => HumanizedChange

export function detectBoolean(candidate: unknown): boolean {
    let b: boolean = !!candidate
    if (typeof candidate === 'string') {
        b = candidate.toLowerCase() === 'true'
    }
    return b
}

export function humanize(
    results: ActivityLogItem[],
    describerFor?: (logItem?: ActivityLogItem) => Describer | undefined,
    asNotification?: boolean
): HumanizedActivityLogItem[] {
    const logLines: HumanizedActivityLogItem[] = []

    for (const logItem of results) {
        const describer = describerFor?.(logItem)
        if (!describer) {
            continue
        }
        const { description, extendedDescription } = describer(logItem, asNotification)
        if (description !== null) {
            logLines.push({
                email: logItem.user.email,
                name: logItem.user.first_name,
                description,
                extendedDescription,
                created_at: dayjs(logItem.created_at),
                unread: logItem.unread,
            })
        }
    }
    return logLines
}
