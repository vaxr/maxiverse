import {Container} from "inversify";
import {Clock, SystemClock} from "@/core/util/clock";
import "@/one-time-imports"

const container = new Container();
container.bind<Clock>(SystemClock).to(SystemClock)

const isServerEnvironment = typeof window === 'undefined'
if (isServerEnvironment) {
    // nothing yet
} else {
    // nothing yet
}

export default container;
