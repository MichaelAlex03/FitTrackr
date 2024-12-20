import { useState, useRef, useEffect } from 'react';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

export default function Register() {

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd])

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd])


  // async function checkEmailExists(email: string) {
  //   try {
  //     const response = await axios.get(`http://localhost:3000/check-email?email=${email}`);
  //     return response.data.exists;
  //   } catch (error) {
  //     console.error('Error checking email:', error);
  //     return false;
  //   }
  // }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/create-account',
        JSON.stringify({
          firstName: user,
          password: pwd,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      console.log(response.data);
      setUser('');
      setPwd('');
      setMatchPwd('');
    } catch (err: any) {
        if (!err?.response) {
          setErrMsg('No Server Response');
        } else if (err.response?.status === 409) {
          setErrMsg('Username Taken');
        } else {
          setErrMsg('Registration Failed');
        }
    }


  }

  return (
    <section className="w-full flex flex-col p-4 items-center justify-center h-screen bg-[#1e90ff] font-sans text-sm">
      <form className='flex flex-col justify-evenly w-full max-w-sm bg-black bg-opacity-40 text-white p-5' onSubmit={handleSubmit}>

        {errMsg && <p className='bg-pink-300 font-semibold p-2 mb-2 text-red-700' aria-live="assertive">{errMsg}</p>}
        <h1 className='font-semibold text-2xl mb-5'>Register</h1>
        <label htmlFor='username'>
          Username:
          {user && (
            <span className='text-lg font-bold ml-1'>
              <FontAwesomeIcon
                icon={validName ? faCheck : faTimes}
                color={validName ? 'green' : 'red'}
              />
            </span>
          )}
        </label>
        <input
          className='text-black rounded-md'
          type='text'
          id='username'
          autoComplete='off'
          onChange={(e) => setUser(e.target.value)}
          value={user}
          required
          aria-invalid={validName ? "false" : "true"}
          aria-describedby='uidnote'
          onFocus={() => setUserFocus(true)}
          onBlur={() => setUserFocus(false)}
        />
        {userFocus && user && !validName && <p id="uidnote" className='bg-black p-2 rounded-md mt-1'>
          <FontAwesomeIcon icon={faInfoCircle} />
          4 to 24 characters.<br />
          Must begin with a letter.<br />
          Letters, numbers, underscores, hyphens allowed.
        </p>}


        <label htmlFor="password">
          Password:
          {pwd && (
            <span className='text-lg font-bold ml-1'>
              <FontAwesomeIcon
                icon={validPwd ? faCheck : faTimes}
                color={validPwd ? 'green' : 'red'}
              />
            </span>
          )}

        </label>
        <input
          className='text-black mb-1 rounded-md'
          type="password"
          id="password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
          aria-invalid={validPwd ? "false" : "true"}
          aria-describedby="pwdnote"
          onFocus={() => setPwdFocus(true)}
          onBlur={() => setPwdFocus(false)}
        />
        {pwdFocus && !validPwd && <p id="pwdnote" className='bg-black p-2 rounded-md mt-1'>
          <FontAwesomeIcon icon={faInfoCircle} className='mt-1 mr-1' />
          8 to 24 characters.<br />
          Must include uppercase and lowercase letters, a number and a special character.<br />
          Allowed special characters: 
            <span aria-label="exclamation mark">!</span> 
            <span aria-label="at symbol">@</span> 
            <span aria-label="hashtag">#</span> 
            <span aria-label="dollar sign">$</span> 
            <span aria-label="percent">%</span>
        </p>}


        <label htmlFor="confirm_pwd">
          Confirm Password:
          {matchPwd && (
            <span className='text-lg font-bold ml-1'>
              <FontAwesomeIcon
                icon={validMatch ? faCheck : faTimes}
                color={validMatch ? 'green' : 'red'}
              />
            </span>
          )}
        </label>
        <input
          className='text-black mb-1 rounded-md'
          type="password"
          id="confirm_pwd"
          onChange={(e) => setMatchPwd(e.target.value)}
          value={matchPwd}
          required
          aria-invalid={validMatch ? "false" : "true"}
          aria-describedby="confirmnote"
          onFocus={() => setMatchFocus(true)}
          onBlur={() => setMatchFocus(false)}
        />
        {matchFocus && !validMatch && <p id="confirmnote" className='bg-black p-2 rounded-md mt-1'>
          <FontAwesomeIcon icon={faInfoCircle} className='mr-1' />
          Must match the first password input field.
        </p>}

        <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>

        <p>
          Already registered?<br />
          <span className="underline">
            <a href="/Login">Sign In</a>
          </span>
        </p>
      </form>
    </section>
  )
}