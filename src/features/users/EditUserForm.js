import { useState, useEffect } from "react"
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { ROLES } from "../../config/roles"

const USER_REGEX = /^[A-z]{3,20}$/
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const EditUserForm = ({ user }) => {
    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()

    const [deleteUser, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteUserMutation()

    const navigate = useNavigate()

    const [username, setUsername] = useState(user.username)
    const [validUsername, setValidUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [role, setRole] = useState(
        user.roles.includes(ROLES.Admin) ? ROLES.Admin
        : user.roles.includes(ROLES.Manager) ? ROLES.Manager
        : ROLES.Employee
    )
    const [active, setActive] = useState(user.active)

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        console.log(isSuccess)
        if (isSuccess || isDelSuccess) {
            setUsername('')
            setPassword('')
            setRole('')
            navigate('/dash/users')
        }
    }, [isSuccess, isDelSuccess, navigate])

    const onUsernameChanged = e => setUsername(e.target.value)
    const onPasswordChanged = e => {setPassword(e.target.value);console.log(role)}
    const onRolesChanged = e => setRole(e.target.value)

    const onActiveChanged = () => setActive(prev => !prev)

    const onSaveUserClicked = async (e) => {
        if (canSave) {
            let roles = []
            if (role === ROLES.Admin) roles = Object.keys(ROLES).map(key => ROLES[key])
            else if (role === ROLES.Manager) roles = [ROLES.Employee, ROLES.Manager]
            else roles = [role]
    
            if (password) {
                await updateUser({ id: user.id, username, password, roles, active })
            } else {
                await updateUser({ id: user.id, username, roles, active })
            }
        }
    }

    const onDeleteUserClicked = async () => {
        await deleteUser({ id: user.id })
    }

    const options = Object.values(ROLES).map(role => {
        return (
            <option
                key={role}
                value={role}
            > 
                {role}
            </option >
        )
    })

    let canSave
    if (password) {
        canSave = [role, validUsername, validPassword].every(Boolean) && !isLoading
    } else {
        canSave = [role, validUsername].every(Boolean) && !isLoading
    }

    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = password && !validPassword ? 'form__input--incomplete' : ''
    const validRolesClass = !role ? 'form__input--incomplete' : ''

    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    return (
        <form className="form" onSubmit={e => e.preventDefault()}>
            <p className={errClass}>{errContent}</p>
            <div className="form__title-row">
                <h2>Edit User</h2>
                {user.roles.includes("Admin") ? <></> :
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Delete"
                            onClick={onDeleteUserClicked}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </div>
                }

            </div>
            <label className="form__label" htmlFor="username">
                Username: <span className="nowrap">[3-20 letters]</span></label>
            <input
                className={`form__input ${validUserClass}`}
                id="username"
                name="username"
                type="text"
                autoComplete="off"
                value={username}
                onChange={onUsernameChanged}
            />
            <label className="form__label" htmlFor="password">
                Password: <span className="nowrap">[empty = no change]</span> <span className="nowrap">[4-12 chars incl. !@#$%]</span></label>
            <input
                className={`form__input ${validPwdClass}`}
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={onPasswordChanged}
            />
            <label className="form__label form__checkbox-container" htmlFor="user-active">
                ACTIVE:
                <input
                    className="form__checkbox"
                    id="user-active"
                    name="user-active"
                    type="checkbox"
                    checked={active}
                    onChange={onActiveChanged}
                />
            </label>
            <div className="form__select-container">
                <label className="form__label" htmlFor="roles">
                    ASSIGNED ROLE:</label>
                <select
                    id="roles"
                    name="roles"
                    className={`form__select ${validRolesClass}`}
                    value={role}
                    onChange={onRolesChanged}
                >
                    {options}
                </select>
            </div>
            <button 
                className="form__submit-button" 
                title="Save"
                onClick={onSaveUserClicked}
            >
                Update User
            </button>
        </form>
    )
}

export default EditUserForm