class ScheduleManager {
    constructor() {
        this.schedules = [
            {
                name: 'Morning',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                startTime: '06:40',
                endTime: '14:29',
                imagePrefix: 'Morning'
            },
            {
                name: 'Evening',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                startTime: '14:30',
                endTime: '22:55',
                imagePrefix: 'Evening'
            },
            {
                name: 'Night',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                startTime: '22:56',
                endTime: '06:39',
                imagePrefix: 'Night'
            },
            {
                name: 'Friday Evening',
                days: ['Friday'],
                startTime: '14:56',
                endTime: '22:55',
                imagePrefix: 'Friday'
            },
            {
                name: 'Saturday',
                days: ['Saturday'],
                startTime: '06:40',
                endTime: '22:55',
                imagePrefix: 'Saturday'
            },
            {
                name: 'Sunday',
                days: ['Sunday'],
                startTime: '06:40',
                endTime: '22:55',
                isRotating: true,
                imagePrefixes: ['SundayMorning', 'SundayEvening']
            }
        ];
        
        this.currentSundayIndex = 0;
        this.sundayRotationInterval = null;
        this.startSundayRotation();
    }

    startSundayRotation() {
        if (this.sundayRotationInterval) {
            clearInterval(this.sundayRotationInterval);
        }

        this.sundayRotationInterval = setInterval(() => {
            this.currentSundayIndex = (this.currentSundayIndex + 1) % 2;
            const event = new CustomEvent('sundayRotation', { 
                detail: { prefix: this.schedules.find(s => s.name === 'Sunday').imagePrefixes[this.currentSundayIndex] } 
            });
            window.dispatchEvent(event);
        }, 15000);
    }

    getCurrentSchedule() {
        const now = new Date();
        const currentDay = this.getDayName(now.getDay());
        const currentTime = this.formatTime(now);

        const nightSchedule = this.schedules.find(s => s.name === 'Night');
        if (this.isTimeInNightShift(currentTime, currentDay)) {
            return nightSchedule;
        }

        if (currentDay === 'Sunday') {
            const sundaySchedule = this.schedules.find(s => s.name === 'Sunday');
            if (sundaySchedule) {
                return {
                    ...sundaySchedule,
                    imagePrefix: sundaySchedule.imagePrefixes[this.currentSundayIndex]
                };
            }
        }

        return this.schedules.find(schedule => {
            if (!schedule.days.includes(currentDay) || schedule.name === 'Night') {
                return false;
            }
            return this.isTimeBetween(currentTime, schedule.startTime, schedule.endTime);
        });
    }

    isTimeInNightShift(currentTime, currentDay) {
        const currentMinutes = this.timeToMinutes(currentTime);
        const nightStartMinutes = this.timeToMinutes('22:56');
        const nightEndMinutes = this.timeToMinutes('06:39');
        return currentMinutes >= nightStartMinutes || currentMinutes <= nightEndMinutes;
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    isTimeBetween(time, start, end) {
        const timeMinutes = this.timeToMinutes(time);
        const startMinutes = this.timeToMinutes(start);
        const endMinutes = this.timeToMinutes(end);
        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    }

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }

    shouldShowImage(imageName) {
        const currentSchedule = this.getCurrentSchedule();
        if (!currentSchedule) return true;
        const nameWithoutExt = imageName.split('.')[0];
        return nameWithoutExt.toLowerCase().startsWith(currentSchedule.imagePrefix.toLowerCase());
    }

    getScheduleInfo() {
        const currentSchedule = this.getCurrentSchedule();
        if (!currentSchedule) return null;
        return {
            name: currentSchedule.name,
            imagePrefix: currentSchedule.imagePrefix,
            startTime: currentSchedule.startTime,
            endTime: currentSchedule.endTime
        };
    }

    cleanup() {
        if (this.sundayRotationInterval) {
            clearInterval(this.sundayRotationInterval);
            this.sundayRotationInterval = null;
        }
    }
}
