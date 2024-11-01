import { ProfileHead } from "./Sections/ProfileHead"
import { UsernameModal } from "../../components/Modals/UsernameModal"

export const Profile = () => {
  return (
    <>
      <div className="w-full h-fit flex relative">
        <ProfileHead />
        {/* <UsernameModal/> */}
      </div >
    </>
  )
}