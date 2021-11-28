function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deleteElementsByArray(base_array, removeable_array) {
    removeable_set = new Set(removeable_array)
    return base_array.filter((num) => {return !removeable_set.has(num)})
}

let tmp_a = '';

class BNDH {
    // Max amount instances BNDH
    static #max_client = 1;
    // Amount instances BNDH
    static #instances = 0;
    // Количество тасков, которое должно быть на стороне клиента
    static max_amount_tasks_for_work = 5;
    // Интервал времени через которое нужно отправлять alive пакет
    static alive_time = 120 * 1000;
    // Интервал времени проверки количества тасков в пуле
    static pull_check = 60 * 1000;
    // Интервал времени проверки общей информации
    static general_info_check = 60 * 1000;
    // Проверка позиции мыши
    static check_mouse_position = 500;
    // Отправка решенных тасков каждые (мс)
    static send_solved_tasks = 10 * 1000
    // Количесвтво хешей 68^2
    static pow_alphabet = 4624
    // Интервал времени получения общей инормации
    static interval_get_info = 10 * 1000



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
    #mouse_position
    #switched
    #work_hashing
    #event
    #current_i
    #status_work_hashing
    #hash_done
    #hash_speed
    #amount_clients

    constructor() {
        BNDH.#instances++
        if (BNDH._instances > BNDH.#max_client) {
            throw new Error('You can\'t create more than 1 instance')
        }
        this.#uid = '';
        this.#alphabet = '';
        this.#tasks = [];
        this.#goal = '';
        this.#done_tasks = [];
        this.#amount_tasks = 0;
        this.#amount_finished_personal_task = 0;
        this.#datetime_start = 0;
        this.#last_check_health = 0;
        this.#switched = 0;
        this.#work_hashing = 0;
        this.#event = 0;
        this.#current_i = 0;
        this.#status_work_hashing = 0;
        this.#hash_done = 0;
        this.#hash_speed = 0;
        this.#amount_clients = 0;
}

    getGoal() {
        return this.#goal;
    }

    getUID() {
        return this.#uid;
    }

    getAmountTask() {
        return this.#tasks.length;
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

    sendJSONToMaster(url, data) {
        url = this.formUrl(url)

        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
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
        return new Promise((resolve, reject) => {
            document.addEventListener('mousemove', (event) => {
	            this.#event = event
            });
            this.sendMessageToMaster("api/v1/bndh/guest/hello", true, null, true).then((data) => {
                this.#uid = data['uuid'];
                this.#last_check_health = data['date_create'];
                this.#datetime_start = new Date(data['date_create']);
                resolve(true)
            })
        })
    }

    // Я жив
    sendCheckHealth() {
        this.sendMessageToMaster("check-health").then((data) => {
            this.date_check = data['date_check']
        })
    }

    getNewGoal() {
        return new Promise((resolve, reject) => {
            this.sendMessageToMaster("get-hash").then((data) => {
            data = JSON.parse(JSON.stringify(data))['hash']
            this.#goal = data['hash'];
            this.#alphabet = data['alphabet'];
            this.#amount_tasks = data['amount_tasks'];
            resolve(true)
            })
        })
    }

    // Дай инфу
    getInfo() {
        client = this
        this.sendMessageToMaster('get-info').then((data) => {
            data = JSON.stringify(data)
            client.#amount_clients = JSON.parse(data)['amount_clients']
            client.#amount_tasks = JSON.parse(data)['amount_tasks']
        })
    }

    // Отправить состояние клиента
    async sendInfo() {
        this.sendMessageToMaster('send-info').then((data) => {
            alert("Data Saved: " + msg);
        })
    }

    // Проверка все ли таски сделаны
    checkSolvedTasks() {
        let client = this
        if (!client.#done_tasks.length) {
            return []
        }
        let tasks = client.#done_tasks
        let skip_item = []
        let solved_tasks = []
        for (let i = 0; i < tasks.length; i++) {
            if (skip_item.includes(tasks[i])) {
                continue
            }
            let elem = tasks[i]
            let all_variants = client.createNewTasks(elem)
            skip_item = skip_item.concat(all_variants)
            for (let j = 0; j < all_variants.length; j++) {
                if (!tasks.includes(all_variants[j])) {
                    break
                }
                if (j == all_variants.length - 1) {
                    solved_tasks.push(tasks[i])
                }
            }
        }
        return solved_tasks
    }

    deleteCompletedTasks(tasks) {
        client = this
        for (let i = 0; i < tasks.length; i++) {
            let task_variants = client.createNewTasks(tasks[i])
            client.#done_tasks = deleteElementsByArray(client.#done_tasks, task_variants)
        }
    }

    // Таск сделан
    async sendSolvedTasks() {
        client = this
        let tasks = client.checkSolvedTasks()
        if (!tasks.length) {
            return false
        }
        let finished_tasks = JSON.stringify({tasks: tasks})
        client.sendJSONToMaster('finished-completed-tasks', finished_tasks).then((data) => {
            let completed_tasks = data['completed_tasks']
            client.deleteCompletedTasks(completed_tasks)
            client.#amount_finished_personal_task += completed_tasks.length
        })
    }

    // Отправить решение
    async sendSolution(pass_str) {
        data = { 'pass_str': pass_str }
        this.sendMessageToMaster('send-answer', false, data).then((data) => {
            alert('Поздавляю пароль найден');
        })
    }



    // Создание новых тасков (с помощью комбинаторики)
    createNewTasks(string) {
        let string_list = [];
        let letter_list = [string[0], string[1]]
        let len_letter_list = letter_list.length
        for (let i = 0; i < len_letter_list; i++) {
            if (letter_list[i] != letter_list[i].toUpperCase()) {
                letter_list.push(letter_list[i].toUpperCase())
            }
        }

        if (letter_list.length == 2 && letter_list[0].toLowerCase() == letter_list[1].toLowerCase()) {
            for (let i = 0; i < letter_list.length - 1; i++) {
                for (let j = i + 1; j < letter_list.length; j++) {
                    string_list.push(letter_list[i].toString() + letter_list[j].toString())
                    string_list.push(letter_list[j].toString() + letter_list[i].toString())
                }
            }
            return string_list
        }

        for (let i = 0; i < letter_list.length - 1; i++) {
            for (let j = i + 1; j < letter_list.length; j++) {
                if (letter_list[i].toLowerCase() == letter_list[j].toLowerCase()) continue;
                string_list.push(letter_list[i].toString() + letter_list[j].toString())
                string_list.push(letter_list[j].toString() + letter_list[i].toString())
            }
        }
        return string_list
    }

    // Создание следующего таска aa->ab, zy->zz:
    createNextStringTask(task) {
        client = this
        let second_letter_index = client.#alphabet.indexOf(task[1])
        let first_letter_index = client.#alphabet.indexOf(task[0])
        let alphabet_length = client.#alphabet.length
        if (second_letter_index > alphabet_length - 1) {
            first_letter_index += 1
            second_letter_index = first_letter_index
            if (first_letter_index > alphabet_length - 1) return null;
        } else {
            second_letter_index += 1
        }
        return client.#alphabet[first_letter_index] + client.#alphabet[second_letter_index]
    }

    // Попросить еще тасков
    async getTasks(amount) {
        this.sendMessageToMaster('get-tasks/'+ amount).then((data) => {
            for (let i=0; i < data.length; i++) {
                let task_strings = [JSON.parse(JSON.stringify(data[i]))['static_string']]
//                let second_task = this.createNextStringTask(task_strings[0])
//                if (second_task) task_strings.push(second_task);
                for (let j = 0; j < task_strings.length; j++) {
                    let tasks = this.createNewTasks(task_strings[j])
                    this.#tasks = this.#tasks.concat(tasks.filter((item) => this.#tasks.indexOf(item) < 0))
                }
            }
        })
    }

    async getGeneralInfo() {
        this.sendMessageToMaster('general-info').then((data) => {
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
    async work(task) {
        if (!task) {
            return true
        }
        client = this
        let len_dynamic_passwd = Math.pow(this.#alphabet.length, 3);
        for (let i = client.#current_i; i < this.#alphabet.length;) {
            client.#current_i = i
            let time_start = new Date()
            for (let j = 0; j < this.#alphabet.length; j++) {
                for (let k = 0; k < this.#alphabet.length; k++) {
                    let potential_hash = task + this.#alphabet[k] + this.#alphabet[j] + this.#alphabet[i]
                    let hash = CryptoJS.MD5(potential_hash).toString();
                    if (hash == this.#goal) {
                        console.log('hash founded!!!! ' + hash)
                        if (this.sendSolution(potential_hash)) {
                            return false;
                        }
                    }
                }
            }
            client.#hash_speed = parseInt(BNDH.pow_alphabet / parseInt(new Date() - time_start)) * 1000
            client.#current_i++;
            return true;
        }
        client.#current_i = 0;
        client.#hash_done = 1
        return true;
    }

    // Проверка количества тасков в пуле + запрос на выдачу новых тасков
    checkPullTask() {
        if (Math.round(BNDH.max_amount_tasks_for_work * 0.7) > this.#tasks.length) {
            this.getTasks(BNDH.max_amount_tasks_for_work - this.#tasks.length)
        }
    }

    async workHashing() {
        client = this
        if (client.#work_hashing == 0) {
            if (client.getGoal()) {
                if (client.getAmountTask()) {
                    if (client.#work_hashing == 0) {
                        setInterval(async function(){
                            client.#work_hashing = 1
                            if (client.#status_work_hashing == 1) {
                                let task = client.getFirstTask()
                                if (await client.work(task)) {
                                    if (client.#hash_done == 1) {
                                        client.#hash_done = 0
                                        client.addDoneTask(task)
                                        client.deleteFirstElem()
                                        console.log(client.#done_tasks)
                                    }
                                } else {
                                    client.flushCurrentWork()
                                    console.log('Отлично! Пароль был найден)')
                                    client.#goal = null
                                }
                            }
                        }, 10)
                    }
                } else {
                    await sleep(10000)
                }
            } else {
                await client.getNewGoal().then(() => {
                    if (!client.getGoal()) {
                        sleep(10 * 1000)
                    } else {
                        let check_work_pull = setInterval(function(){client.checkPullTask();}, 10000)
                        let check_hash_info = setInterval(function(){client.checkGeneralInfo();}, BNDH.general_info_check)
                    }
                })

            }
        } else {
            console.log('workHashing created')
        }
    }

    // Проверка позиции мыши на экране
    check_mouse_position() {
        client = this
        let e = this.#event;
        if (client.#mouse_position != e.pageX) {
            console.log('mouse new position')
            client.#status_work_hashing = 0
            client.#mouse_position = e.clientX
            setTimeout(function() {client.#status_work_hashing = 1;}, 2 * 1000)
        }
    }

    workTime() {
        let now = new Date()
        return new Date(parseInt(now - this.#datetime_start)).toISOString().substr(11, 8)
    }

    dynamic_content() {
        client = this
        $('#clientUUID').text(client.#uid)
        $('#amountTask').text(client.#amount_tasks)
        $('#hashGoal').text(client.#goal)
        $('#finishedTasks').text(client.#amount_finished_personal_task)
        $('#checkHealthTime').text(client.#last_check_health)
        $('#workTime').text(client.workTime())
        $('#hashSpeed').text(client.#hash_speed)
        $('#amountClients').text(client.#amount_clients)
    }
}


async function BNDHWorkManager() {
    // Work Manager
    client = new BNDH()
    await client.connectToMaster().then(() => {
//        setInterval(function(){client.sendCheckHealth();}, BNDH.alive_time)
        setInterval(function(){client.getInfo();}, BNDH.interval_get_info)
        setInterval(function(){client.check_mouse_position();}, BNDH.check_mouse_position)
        setInterval(function(){client.sendSolvedTasks();}, BNDH.send_solved_tasks)
        setInterval(function(){client.workHashing();}, 10 * 1000)
        setInterval(function(){client.dynamic_content();}, 1 * 1000)
    })
}


$(document).ready(function () {
    BNDHWorkManager()
})