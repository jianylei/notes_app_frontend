import { useGetNotesQuery } from "./notesApiSlice"
import Note from "./Note"
import useAuth from "../../hooks/useAuth"
import { PulseLoader } from "react-spinners"
import useTitle from "../../hooks/useTitle"
import { useEffect } from 'react'

const NotesList = () => {
    useTitle('shopNotes: Notes List')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { username, isManager, isAdmin } = useAuth()

    const {
        data: notes,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetNotesQuery('notesList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let content

    if (isLoading) content = <PulseLoader color={'#FFF'} />

    if (isError) {
        content = <p className="errmsg">{error?.data?.message}</p>
    }

    if (isSuccess) {
        const { ids, entities } = notes

        let filteredIds
        if (isManager || isAdmin) {
            filteredIds = [...ids]
        } else {
            filteredIds = ids.filter(noteId => entities[noteId].username === username)
        }  
        
        const notesContent = ids?.length 
            && filteredIds.map(noteId => <Note key={noteId} noteId={noteId} />)

        content = (
            <div className='content__container'>
                <h2>Notes</h2>
                {notesContent}
            </div>
        )
    }
    return content
}

export default NotesList