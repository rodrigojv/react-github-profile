import {useReducer, useEffect, useContext, useRef} from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import * as GitHub from '../../../github-client'

const Query = ({query, variables, normalize = data => data, children}) => {
  const initialState = {loaded: false, fetching: false, data: null, error: null}
  const [state, setState] = useReducer(
    (oldState, newState) => ({...oldState, ...newState}),
    initialState,
  )
  const client = useContext(GitHub.Context)

  useEffect(() => {
    if (isEqual(previousInputs.current, [query, variables])) {
      return
    }
    setState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        setState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })
  const previousInputs = useRef()
  useEffect(() => {
    previousInputs.current = [query, variables]
  })

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
