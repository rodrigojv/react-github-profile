import {useReducer, useEffect, useContext, useRef} from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import * as GitHub from '../../../github-client'

function useSetState(initialState) {
  const [state, setState] = useReducer(
    (oldState, newState) => ({...oldState, ...newState}),
    initialState,
  )
  return [state, setState]
}

function useSafeSetState(initialState) {
  const [state, setState] = useSetState(initialState)
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeSetState = (...args) => mountedRef.current && setState(...args)

  return [state, safeSetState]
}

function usePrevious(values) {
  const previousInputs = useRef()
  useEffect(() => {
    previousInputs.current = values
  })
  return previousInputs.current
}

const Query = ({query, variables, normalize = data => data, children}) => {
  const initialState = {loaded: false, fetching: false, data: null, error: null}
  const [state, safeSetState] = useSafeSetState(initialState)
  const client = useContext(GitHub.Context)

  useEffect(() => {
    if (isEqual(previousInputs, [query, variables])) {
      return
    }
    safeSetState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        safeSetState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })

  const previousInputs = usePrevious([query, variables])

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
