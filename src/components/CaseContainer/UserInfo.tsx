import React from "react";

import styles from './CaseContainer.module.css';

interface UserInfoProps {
    name: string;
    role: string;
}

const UserInfo = ({name, role }: UserInfoProps) => {
    return (
        <div className={styles.userInfo}>
            <span className={styles.userName}>{name}</span>
            <span className={styles.userRole}>{role}</span>
        </div>
    );
};
export default UserInfo;