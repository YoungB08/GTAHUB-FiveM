import style from './style.module.css'
import {useCallback, useContext, FunctionComponent, ComponentProps} from "react";
import {SpawnContext} from "../../context/spawn";
import SpawnList from "../../config/spawn";
import fetchAPI from "../../hooks/fetchAPI";

const LocationPicker = () => {
    const {updateSpawn, spawn} = useContext(SpawnContext)

    return (
        <div>
            {SpawnList.filter(s => s.identifier !== 'default').map(s => (
                <div 
                    key={s.identifier}
                    className={`${style.icon} ${spawn.identifier === s.identifier ? style.icon_active : ''}`} 
                    style={s.waypoint && {top: s.waypoint.top, left: s.waypoint.left}} 
                    onClick={() => updateSpawn(s)}
                    title={s.name}
                >
                    <svg height='2.6rem' width='2.6rem' fill='currentColor' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M168.3 499.2C116.1 435 0 279.4 0 192C0 85.96 85.96 0 192 0C298 0 384 85.96 384 192C384 279.4 267 435 215.7 499.2C203.4 514.5 180.6 514.5 168.3 499.2H168.3zM192 256C227.3 256 256 227.3 256 192C256 156.7 227.3 128 192 128C156.7 128 128 156.7 128 192C128 227.3 156.7 256 192 256z"/>
                    </svg>
                    <span className={style.icon_label}>{s.name}</span>
                </div>
            ))}
        </div>
    );
}

const LocationPreview: FunctionComponent<ComponentProps<any>> = (props) => {
    const {spawn, updateSpawn} = useContext(SpawnContext)

    const currentSpawn = spawn.identifier === 'default' ? SpawnList[1] : spawn;

    const ValidateSpawn = useCallback(() => {
        fetchAPI('/SpawnPlayer', {SpawnId: currentSpawn.identifier})
    }, [currentSpawn, fetchAPI])

    return (
        <section className={style.container} style={props.style}>
            <div className={style.preview} style={{backgroundImage: `url(${currentSpawn.image})`}} />
            <h3 className={style.title}>{currentSpawn.name}</h3>
            
            <div className={style.quick_tabs}>
                {SpawnList.filter(s => s.identifier !== 'default').map(s => (
                    <button 
                        key={s.identifier}
                        type="button"
                        className={`${style.tab_btn} ${currentSpawn.identifier === s.identifier ? style.tab_btn_active : ''}`}
                        onClick={() => updateSpawn(s)}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            <h4 className={style.description}>{currentSpawn.description}</h4>
            <div className={style.button} style={{
                transition: "all .5s",
                opacity: '1',
                top: '0vh'
            }}>
                <div onClick={ValidateSpawn}>Bắt Đầu Tại Đây 🚀</div>
            </div>
        </section>
    );
}

export {LocationPreview, LocationPicker}
