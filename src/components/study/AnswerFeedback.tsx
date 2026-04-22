import { ProgressBadge } from '@/components/shared/ProgressBadge';
import type { StudyFeedbackState } from '@/state/studyStore';
import { formatDateTime } from '@/utils/dates';

export interface AnswerFeedbackProps {
  feedback?: StudyFeedbackState;
}

export function AnswerFeedback({ feedback }: AnswerFeedbackProps) {
  if (!feedback) {
    return null;
  }

  return (
    <section className="panel stack gap-md" aria-live="polite">
      <div className="feedback-header">
        <h2 className="subsection-title">Vyhodnocení odpovědi</h2>
        <ProgressBadge label={mapAccuracyLabel(feedback.accuracy)} tone={mapAccuracyTone(feedback.accuracy)} />
      </div>
      <p className="text-body">{feedback.explanation}</p>
      <ul className="feature-list">
        <li>{`Na co se zaměřit příště: ${mapProblemTypeLabel(feedback.problemType)}`}</li>
        <li>{`Doporučený návrat k tématu: ${formatDateTime(feedback.nextReviewAt)}`}</li>
      </ul>
    </section>
  );
}

function mapAccuracyLabel(accuracy: StudyFeedbackState['accuracy']): string {
  switch (accuracy) {
    case 'correct':
      return 'správně';
    case 'incorrect':
      return 'nesprávně';
    case 'correct-after-hint':
      return 'správně po nápovědě';
    case 'skipped':
      return 'přeskočeno';
  }
}

function mapAccuracyTone(accuracy: StudyFeedbackState['accuracy']): 'mastered' | 'growing' | 'needs-review' | 'at-risk' {
  switch (accuracy) {
    case 'correct':
      return 'mastered';
    case 'correct-after-hint':
      return 'growing';
    case 'skipped':
      return 'needs-review';
    case 'incorrect':
      return 'at-risk';
  }
}

function mapProblemTypeLabel(problemType: string): string {
  switch (problemType) {
    case 'discipline-assignment':
      return 'oborové zařazení potřebuje ještě upevnit';
    case 'institution-link':
      return 'je potřeba lépe propojit osobnosti a instituce';
    case 'test-link':
      return 'je potřeba lépe odlišit škálu, test nebo autora';
    case 'historical-sequence':
      return 'historická návaznost ještě není jistá';
    case 'similar-person-confusion':
      return 'dochází k záměně podobných osobností';
    case 'needed-hint':
      return 'řešení se povedlo až s nápovědou';
    case 'active-recall-gap':
      return 'vybavení odpovědi z paměti ještě není jisté';
    default:
      return 'téma si zaslouží ještě jedno krátké zopakování';
  }
}
