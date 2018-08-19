import { takeEvery, put, call, select } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'
import selectors from '../selectors'
import { misc, samples, gists, host } from '../actions'

function* onInitializeSaga() {
  // yield put(samples.fetchMetadata.request())
  // yield put(gists.fetchMetadata.request())
  const currentHost = yield select(selectors.host.get)
  yield put(host.change(currentHost))
}

export default function* miscWatcher() {
  yield takeEvery(getType(misc.initialize), onInitializeSaga)
}
