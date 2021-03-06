import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../reducers/actions.js'
import { FaEdit } from "react-icons/fa";
import { validateMinMax, validateDoubleEntry } from '../util/Utilities.js'
import Dexie from 'dexie';

const getPos = (question_id) => {
    const elemChild = document.getElementById("form-" + question_id);
    const elemParent = document.getElementById("form-container");
    const divElem = document.getElementById("card-body-" + question_id);
    if (elemChild !== null && elemParent !== null) {
        elemParent.scrollTop = elemChild.offsetTop - elemParent.offsetTop - 17;
        divElem.classList.add("ov-alerts");
        setTimeout(() => {
            divElem.classList.remove("ov-alerts");
        }, 3000)
    }
    return true;
}


class OverviewQuestion extends Component {
    constructor(props) {
        super(props);
        this.renderAnswer = this.renderAnswer.bind(this);
        this.renderEdit = this.renderEdit.bind(this);
        this.goToAnswer = this.goToAnswer.bind(this);
    }

    goToAnswer(gi, qid) {
        this.props.changeGroup(gi.index);
        this.props.showOverview(false);
        setTimeout(() => {
            getPos(qid);
        }, 300)
    }

    renderEdit(mandatory, qid, group) {
        let badge = mandatory ? " badge-red" : " badge-secondary";
        return (
            <div
                className="badge-overview"
                key={qid}
                onClick={e => this.goToAnswer(group, qid)}
            >
                <div className={"badge badge-left" + badge}><FaEdit /></div>
                <div className={"badge badge-right" + badge}>Edit</div>
            </div>
        )
    }

    renderAnswer(qid, answer, question) {
        let valid;
        switch(question.type){
            case "cascade":
                let cascade = [];
                answer = JSON.parse(answer);
                if (answer.length === question.levels.level.length) {
                    answer.forEach(x => cascade.push(x.text));
                    return cascade.join(' - ');
                }
                return false;
            case "option":
                let options = [];
                answer = JSON.parse(answer);
                answer.forEach((x,i) => {
                    let text = x.text;
                    if (x.text === "Other Option") {
                        text = localStorage.getItem("other_" + qid);
                    }
                    options[i] = text;
                });
                return options.length === 1 ? options[0] : options.join(', ');
            case "photo":
                const db = new Dexie('akvoflow');
                db.version(1).stores({files: 'id'});
                db.files.get(answer).then(value => {
                    document.getElementById("img-ov-" + answer).src = value.blob;
                });
                return (<img className="img img-fluid" id={"img-ov-" + answer} alt={answer}/>);
            case "geo":
                answer = answer.split('|')
                return (<div>Latitude: {answer[0]}<br/>Longitude: {answer[0]}</div>);
            case "number":
                valid = validateMinMax(answer, question);
                valid = valid !== null ? validateDoubleEntry(answer, question) : valid;
                return valid !== null ? answer.toString() : false;
            default:
                valid = validateDoubleEntry(answer, question);
                return valid !== null ? answer.toString() : false;
        }
    }

    render() {
        let qid = this.props.qid.replace('-0', this.props.iter);
        let question = this.props.value.questions.find(q => q.id === qid);

        let localization = this.props.value.lang.active;
        localization = localization.map((x) => {
            let active = question.lang[x] === undefined ? "" : question.lang[x];
            return active;
        });
        localization = localization.filter(x => x !== "");
        localization = localization.length === 0 ? question.lang.en : localization.join(" / ");

        let answer = localStorage.getItem(qid);
        let divclass = answer === null ? "text-red" : "";
        answer = answer === null ? false : this.renderAnswer(qid, answer, question);
        if (question === undefined) {
            return (<div key="oq-loading"><p>Loading...</p></div>)
        }
        if (question.overview) {
            return (
                <div className="row ov-list" key={"oq-" + this.props.group.index + qid}>
                    <div className="col-md-8 ov-question">
                        <div className="ln-index">{this.props.index + 1}</div>
                        <div className="ln-question">{localization}</div>
                    </div>
                            <div className="col-md-4">
                        { answer ? (
                            <div className={"ov-answer" + divclass}>{answer}</div>
                        ) : this.renderEdit(question.mandatory, qid, this.props.group)}
                    </div>
                </div>
            );
        }
        return "";
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewQuestion);
