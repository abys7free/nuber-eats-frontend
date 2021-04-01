import { gql, useApolloClient, useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'
import { useMe } from '../../hooks/useMe'
import { verifyEmail, verifyEmailVariables } from '../../__generated__/verifyEmail'

const VERIFY_EMAIL_MUTAION = gql`
  mutation verifyEmail($input:VerifyEmailInput!){
    verifyEmail(input:$input){
      ok
      error
    }
  }
`



export const ConfirmEmail = () => {
  const { data: userData } = useMe();
  const client = useApolloClient();
  const history = useHistory();
  const onCompleted = (data: verifyEmail) => {
    const { verifyEmail: { ok } } = data;
    if (ok && userData?.me) {
      client.writeFragment({
        id: `User:${userData?.me.id}`,
        fragment: gql`
          fragment VerifiedUser on User {
            verified
          }
        `,
        data: {
          verified: true,
        }
      });
      history.push('/');
    }
  }
  const [verifyEmail] = useMutation<verifyEmail, verifyEmailVariables>(
    VERIFY_EMAIL_MUTAION, {
    onCompleted,
  }
  )
  useEffect(() => {
    const [_, code] = window.location.href.split("code=")
    console.log(code);
    verifyEmail({
      variables: {
        input: {
          code,
        }
      }
    })
  }, []);
  return (
    <div className='mt-52 flex flex-col items-center justify-center'>
      <Helmet>
        <title>Verify Email | Nuber Eats</title>
      </Helmet>
      <h2 className="text-lg mb-2 font-medium">Confirming email...</h2>
      <h4 className="text-gray-700 text-sm">Please wait, don't close this page...</h4>
    </div>)
}