import { gql, useApolloClient, useMutation } from '@apollo/client';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { authTokenVar, isLoggedInVar } from '../../apollo';
import { Button } from '../../components/button';
import { LOCALSTORAGE_TOKEN } from '../../constants';
import { useMe } from '../../hooks/useMe';
import { editProfile, editProfileVariables } from '../../__generated__/editProfile';

const EDIT_PROFILE_MUTATION = gql`
  mutation editProfile($input:EditProfileInput!){
    editProfile(input: $input){
      ok
      error
    }
  }
`


interface IFormProps {
  email?: string;
  password?: string;
}



export const EditProfile = () => {
  const { data: userData } = useMe();
  const client = useApolloClient();
  const onCompleted = (data: editProfile) => {
    const { editProfile: { error, ok } } = data;
    if (ok && userData) {
      const { me: { email: prevEmail, id } } = userData;
      const { email: newEmail } = getValues();
      if (prevEmail !== newEmail) {
        client.writeFragment({
          id: `User:${id}`,
          fragment: gql`
            fragment EditedUser on User {
              verified
              email
            }
          `,
          data: {
            email: newEmail,
            verified: false,
          }
        });
      }
      /// update the cashe
    }
  }
  const [editProfile, { loading }] = useMutation<editProfile, editProfileVariables>(EDIT_PROFILE_MUTATION, {
    onCompleted
  });
  const { register, handleSubmit, getValues, formState } = useForm<IFormProps>({
    mode: "onChange",
    defaultValues: {
      email: userData?.me.email,
    }
  });
  const onSubmit = () => {
    const { email, password } = getValues();
    editProfile({
      variables: {
        input: {
          email,
          ...(password !== "" && { password })
        }
      }
    })
  }
  const history = useHistory();
  const onClick = () => {
    localStorage.setItem(LOCALSTORAGE_TOKEN, "")
    authTokenVar("");
    isLoggedInVar(false);
    client.clearStore();
    history.push('/');
  }
  return (
    <div className="mt-52 flex flex-col justify-center items-center">
      <Helmet>
        <title>Edit Profile | Nuber Eats</title>
      </Helmet>
      <div className="relative flex w-full max-w-screen-sm mb-3 justify-center items-center">
        <h4 className='font-semibold text-2xl  text-center'>Edit Profile</h4>
        <button
          onClick={() => onClick()}
          className="absolute right-0 bg-gray-800 text-white py-1 px-2 text-center text-sm font-semibold rounded-sm">Log Out</button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5">
        <input
          ref={register({
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          })} name="email" className="input" type='email' placeholder="Email" />
        <input ref={register} name="password" className="input" type='password' placeholder="Password" />
        <Button loading={loading} canClick={formState.isValid} actionText="Save Profile" >Update Profile</Button>
      </form>
    </div>
  )
}