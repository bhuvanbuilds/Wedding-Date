/**
 * Creates the "Wedding website details" Google Form.
 * 1. Open https://script.google.com → New project
 * 2. Replace everything with this file, click Run (▶) on createWeddingForm
 * 3. Allow the permission prompt (it only creates a form in your Drive)
 * 4. Open View → Logs (or Execution log) for the form's edit + share links
 */
function createWeddingForm() {
  const form = FormApp.create('Wedding website — details for Sam & Prithiksha')
  form.setDescription(
    'Please fill in what you can. Anything left blank shows as "to be announced" on the website — you can always send more later.',
  )
  form.setCollectEmail(false)

  const text = (title, help, required) => {
    const q = form.addTextItem().setTitle(title).setRequired(!!required)
    if (help) q.setHelpText(help)
  }
  const para = (title, help) => {
    const q = form.addParagraphTextItem().setTitle(title)
    if (help) q.setHelpText(help)
  }
  const time = (title) => form.addTimeItem().setTitle(title)
  const section = (title, help) => {
    const s = form.addSectionHeaderItem().setTitle(title)
    if (help) s.setHelpText(help)
  }
  const choice = (title, options) => form.addMultipleChoiceItem().setTitle(title).setChoiceValues(options)

  section('1. Names')
  text("Groom's full name (as it should appear)", '', true)
  text("Bride's full name (as it should appear)", '', true)

  section('2. Marriage (ceremony)', 'Date: 08 February 2027')
  choice('Is 08 February 2027 correct for the marriage?', ['Yes', 'No — I will write the correct date below'])
  text('Correct marriage date (only if different)')
  time('Marriage start time')
  time('Marriage end time (optional)')
  text('Marriage venue name')
  para('Marriage venue full address')
  text('Dress code for the marriage (optional)')
  para('Notes for guests — marriage (optional)', 'e.g. "Please arrive 15 minutes early"')

  section('3. Reception')
  form.addDateItem().setTitle('Reception date')
  time('Reception start time')
  time('Reception end time (optional)')
  choice('Is the reception at the same venue as the marriage?', ['Yes', 'No'])
  text('Reception venue name (if different)')
  para('Reception venue full address (if different)')
  text('Dress code for the reception (optional)')
  para('Notes for guests — reception (optional)')

  section('4. Travel & parking', 'If the two venues are different, please mention both.')
  text('Nearest landmark')
  para('By car / taxi')
  para('By bus (route numbers, nearest stop)')
  para('By train / metro (nearest station)')
  para('From the airport (for guests flying in)')
  para('Parking (available? where? free or paid?)')
  para('Arrival notes (gate to use, drop-off point, etc.)')

  section('5. Our story (optional)')
  para('A short "about us" in your own words (3–5 lines)')
  para('Key moments for a timeline (optional)', 'One per line: year — title — one or two lines')

  section(
    '6. Photos',
    'Please send ORIGINAL files (not WhatsApp-compressed) by Google Drive or email: 2 photos for the "Our Story" arches and 6–10 for the gallery (portrait works best).',
  )
  text('Link to your photos (Google Drive / Dropbox / etc.)')
  para('Captions for the gallery photos (optional)', 'One per line, in the same order as the photos')

  section('7. Music (optional)')
  choice('Background music', ['Use the built-in soft melody', 'I will send our own song (mp3)'])

  section('8. Wishes guestbook')
  text('Who will approve guest wishes before they appear? (name + email)')

  section('9. Anything else')
  choice('Bible verse on the site: Song of Solomon 3:4 (KJV)', ['Keep it', 'Change it (write below)'])
  text('New verse (only if changing)')
  para('Anything else you would like on the website?')

  Logger.log('Edit the form:  ' + form.getEditUrl())
  Logger.log('Send to client: ' + form.getPublishedUrl())
}
