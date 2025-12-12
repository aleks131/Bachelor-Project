class ScheduleManager {
    constructor() {
        this.schedules = [
            {
                name: 'Morning',
                startTime: '06:30',
                endTime: '14:29',
                imagePrefix: 'Morning'
            },
            {
                name: 'Evening',
                startTime: '14:30',
                endTime: '22:29',
                imagePrefix: 'Evening'
            },
            {
                name: 'Night',
                startTime: '22:30',
                endTime: '06:29',
                imagePrefix: 'Night'
            }
        ];
    }

    getCurrentSchedule() {
        const now = new Date();
        const currentTime = this.formatTime(now);
        
        console.log('[Schedule] Current time:', currentTime);

        const nightSchedule = this.schedules.find(s => s.name === 'Night');
        if (this.isTimeInNightShift(currentTime)) {
            console.log('[Schedule] Night shift detected');
            return nightSchedule;
        }

        const currentSchedule = this.schedules.find(schedule => {
            if (schedule.name === 'Night') {
                return false;
            }
            const isInTimeRange = this.isTimeBetween(currentTime, schedule.startTime, schedule.endTime);
            console.log('[Schedule] Checking:', schedule.name, 'Result:', isInTimeRange);
            return isInTimeRange;
        });

        console.log('[Schedule] Selected:', currentSchedule?.name || 'None');
        return currentSchedule;
    }

    isTimeInNightShift(currentTime) {
        const currentMinutes = this.timeToMinutes(currentTime);
        const nightStartMinutes = this.timeToMinutes('22:30');
        const nightEndMinutes = this.timeToMinutes('06:29');
        
        const isInNightShift = currentMinutes >= nightStartMinutes || currentMinutes <= nightEndMinutes;
        console.log('Night shift check:', currentTime, isInNightShift);
        return isInNightShift;
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    isTimeBetween(time, start, end) {
        const timeMinutes = this.timeToMinutes(time);
        const startMinutes = this.timeToMinutes(start);
        const endMinutes = this.timeToMinutes(end);
        
        const isInRange = timeMinutes >= startMinutes && timeMinutes <= endMinutes;
        console.log(`Time check: ${time} between ${start}-${end}: ${isInRange}`);
        return isInRange;
    }

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    shouldShowImage(imageName) {
        const currentSchedule = this.getCurrentSchedule();
        if (!currentSchedule) {
            console.log('No active schedule, showing all images');
            return true;
        }

        const nameWithoutExt = imageName.split('.')[0];
        const shouldShow = nameWithoutExt.toLowerCase().startsWith(currentSchedule.imagePrefix.toLowerCase());
        console.log(`Image check: ${imageName} for schedule ${currentSchedule.name}: ${shouldShow}`);
        return shouldShow;
    }

    getScheduleInfo() {
        const currentSchedule = this.getCurrentSchedule();
        if (!currentSchedule) {
            console.log('No schedule info available');
            return null;
        }

        const info = {
            name: currentSchedule.name,
            imagePrefix: currentSchedule.imagePrefix,
            startTime: currentSchedule.startTime,
            endTime: currentSchedule.endTime
        };
        console.log('Current schedule info:', info);
        return info;
    }

    cleanup() {
    }
}
