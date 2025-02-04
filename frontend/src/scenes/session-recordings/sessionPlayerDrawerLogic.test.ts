import { router } from 'kea-router'
import { expectLogic } from 'kea-test-utils'
import { initKeaTests } from '~/test/init'
import { sessionPlayerDrawerLogic } from './sessionPlayerDrawerLogic'
import { useMocks } from '~/mocks/jest'

describe('sessionPlayerDrawerLogic', () => {
    let logic: ReturnType<typeof sessionPlayerDrawerLogic.build>
    const listOfSessionRecordings = [{ id: 'abc', viewed: false, recording_duration: 10 }]

    beforeEach(() => {
        useMocks({
            get: {
                '/api/projects/:team/session_recordings': [
                    200,
                    {
                        results: listOfSessionRecordings,
                    },
                ],
            },
        })
        initKeaTests()
        logic = sessionPlayerDrawerLogic()
        logic.mount()
    })
    describe('activeSessionRecording', () => {
        it('starts as null', () => {
            expectLogic(logic).toMatchValues({ activeSessionRecording: null })
        })
        it('is set by openSessionPlayer and cleared by closeSessionPlayer', async () => {
            expectLogic(logic, () => logic.actions.openSessionPlayer({ id: 'abc' }))
                .toDispatchActions(['getSessionRecordingsSuccess'])
                .toMatchValues({
                    partialSessionRecording: { id: 'abc' },
                    activeSessionRecording: listOfSessionRecordings[0],
                })
            expect(router.values.hashParams).toHaveProperty('sessionRecordingId', 'abc')

            expectLogic(logic, () => logic.actions.closeSessionPlayer()).toMatchValues({
                activeSessionRecording: null,
            })
            expect(router.values.hashParams).not.toHaveProperty('sessionRecordingId')
        })

        it('is read from the URL on the session recording page', async () => {
            router.actions.push('/recordings', {}, { sessionRecordingId: 'abc' })
            expect(router.values.hashParams).toHaveProperty('sessionRecordingId', 'abc')

            await expectLogic(logic).toDispatchActions([logic.actionCreators.openSessionPlayer({ id: 'abc' })])
        })
    })
})
