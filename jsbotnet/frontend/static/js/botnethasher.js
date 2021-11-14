function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class BNDH {
    // Max amount instances BNDH
    static #max_client = 1
    // Amount instances BNDH
    static #instances = 0
    // Количество тасков, которое должно быть на стороне клиента
    static max_amount_tasks_for_work
    // Интервал времени через которое нужно отправлять alive пакет
    static alive_time
    // Интервал времени проверки количества тасков в пуле
    static pull_check
    // Интервал времени проверки общей информации
    static general_info_check

    #uid
    #alphabet
    #tasks
    #goal
    #done_tasks
    // Количество оставшихся тасков для текущего хеша
    #amount_tasks
    #amount_finished_personal_task
    #datetime_start
    #last_check_health

    constructor() {
        BNDH.#instances++
        if (BNDH._instances > BNDH.#max_client) {
            throw new Error('You can\'t create more than 1 instance')
        }
        this.max_amount_tasks_for_work = 80;
        this.alive_time = 120 * 1000;
        this.pull_check = 60 * 1000;
        this.general_info_check = 60 * 1000;
        this.#uid = '';
        this.#alphabet = '';
        this.#tasks = [];
        this.#goal = '';
        this.#done_tasks = [];
        this.#amount_tasks = 0
        this.#amount_finished_personal_task = 0
        this.#datetime_start = 0
        this.#last_check_health = 0
}

    getGoal() {
        return this.#goal;
    }

    getUID() {
        return this.#uid;
    }

    getAmountTask() {
        return this.#tasks.len_hashes;
    }

    addDoneTask(task) {
        return this.#done_tasks.push(task)
    }

    deleteFirstElem() {
        return this.#tasks.splice(0, 1);
    }

    getFirstTask() {
        return this.#tasks[0];
    }

    setUID(val) {
        this.#uid = val
    }

    // Сформировать ссылку
    formUrl(url) {
        return '/api/v1/bndh/user/' + this.#uid + '/' + url
    }

    getNewGoal() {
        $.ajax({
            type: "GET",
            url: this.formUrl("check-health"),
        }).done(function (data) {
            if (data['status'] === '200') {
                this.#goal = data['hash'];
                this.#alphabet = data['alphabet'];
                this.#amount_tasks = data['amount_tasks'];
            } else {
                console.log('getNewGoal(): Чёт мастер не хочет работать с тобой')
            }
        });
    }

    sendMessageToMaster(url, get=true, data=null, raw_url=false) {
        if (!raw_url) {
            url = this.formUrl(url)
        }

        let type_msg = "GET"
        if (!get) {
            type_msg = "POST"
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                type: type_msg,
                url: url,
                data: data,
                success: function(data) {
                    resolve(data)
                },
                error: function(err) {
                    console.log('Чёт мастер не хочет работать с тобой')
                    reject(err)
                }
            })
        })
    }

    connectToMaster() {
        this.sendMessageToMaster("api/v1/bndh/guest/hello", raw_url=true).then((data) => {
            this.#uid = data['uuid'];
            this.#last_check_health = data['date_create'];
            this.#datetime_start = data['date_create'];
        })
    }

    // Я жив
    sendCheckHealth() {
        console.log(this)
        this.sendMessageToMaster("check-health").then((data) => {
            this.date_check = data['date_check']
        })
    }

    // Дай инфу
    getInfo() {
        this.sendMessageToMaster('get-info').then((data) => {
            alert("Data Saved: " + msg);
        })
    }

    // Отправить состояние клиента
    async sendInfo() {
        this.sendMessageToMaster('send-info').then((data) => {
            alert("Data Saved: " + msg);
        })
    }

    // Таск сделан
    async sendSolution(tasks) {
        data = { 'tasks': tasks }
        this.sendMessageToMaster('send-info', get=false, data=data).then((data) => {
            this.#amount_finished_personal_task = data['amount_finished_personal_task']
        })
    }

    // Отправить решение
    async sendSolution(pass_str) {
        data = { 'pass_str': pass_str }
        this.sendMessageToMaster('send-answer', get=false, data=data).then((data) => {
            alert('Поздавляю пароль найден');
        })
    }

    // Попросить еще тасков
    async getTasks(amount) {
        data = { 'amount': amount }
        this.sendMessageToMaster('get-tasks', data=data).then((data) => {
            this.#tasks.push(data['new_tasks'])
        })
    }

    async getGeneralInfo() {
        this.sendMessageToMaster('general-info', data=data).then((data) => {
            this.#alphabet = data['alphabet']
            this.#amount_tasks = data['amount_tasks']
            this.#goal = data['hash']
        })
    }

    flushCurrentWork() {
        clearInterval(check_work_pull)
        clearInterval(check_hash_info)
        this.#goal = null
        this.#tasks = null
        this.#alphabet = null
    }

    checkGeneralInfo() {
        if (!this.#alphabet ||
            !this.#goal ||
            !this.#amount_tasks ||
            !this.#amount_finished_personal_task ||
            !this.#datetime_start
        ) {
            this.getGeneralInfo()
        }
    }

    // Выполнять таски
    work(task) {
        let len_hashes = Math.pow(this.#alphabet.length, 3);
        for (var i = 0; i < len_hashes; i++) {
            for (var j = 0; j < this.#alphabet.length; j++) {
                for (var k = 0; k < this.#alphabet.length; k++) {
                    potential_hash = task + this.#alphabet[k] + this.#alphabet[j] + this.#alphabet[i]
                    hash = CryptoJS.MD5(potential_hash).toString();
                    if (hash == this.#goal) {
                        if (this.sendSolution(potential_hash)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    // Проверка количества тасков в пуле + запрос на выдачу новых тасков
    checkPullTask() {
        if (Math.round(BNDH.max_amount_tasks_for_work * 0.7) > this.#tasks.length) {
            this.getTasks(BNDH.max_amount_tasks_for_work - this.#tasks.length)
        }
    }
}


async function BNDHWorkManager() {
    // Work Manager

    client = new BNDH()
    if (client && client.connectToMaster()) {
        let check_health = setInterval(client.sendCheckHealth, BNDH.alive_time)
        setInterval(async function() {
             if (client.getGoal() != null) {
                if (client.getAmountTask() != 0) {
                    task = client.getFirstTask()
                    if (client.work(task)) {
                        client.addDoneTask(task)
                        client.deleteFirstElem()
                    } else {
                        client.flushCurrentWork()
                        console.log('Отлично! Пароль был найден)')
                    }
                } else {
                    await sleep(2000)
                }
            } else {
                client.getNewGoal()
                if (client.getGoal() == null) {
                    await sleep(10 * 1000)
                } else {
                    let check_work_pull = setInterval(client.checkPullTask, BNDH.pull_check)
                    let check_hash_info = setInterval(client.checkGeneralInfo, BNDH.general_info_check)
                }
            }
        }, 100)
    }

    

}


$(document).ready(function () {
    BNDHWorkManager()
})