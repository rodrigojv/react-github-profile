import {useReducer, useEffect, useContext} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'

const Query = ({query, variables, normalize = data => data, children}) => {
  const initialState = {loaded: false, fetching: false, data: null, error: null}
  const [state, setState] = useReducer(
    (oldState, newState) => ({...oldState, ...newState}),
    initialState,
  )
  const client = useContext(GitHub.Context)

  useEffect(
    () => {
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
    },
    [query, variables],
  )

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
