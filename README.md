# remote-teaching

### How to run this project

1. Install packages and dependencies

   > npm install

2. Run Web Server

> npm start

### Milestone

Ordered by Priority

1. Showing content from content service. (pull LP and pull all Classroom Material content, paging through)
2. VPCs, Poems, Big Books, Stories, and story dictionaries: (interactivity)
   1. Poems, Big Books, Stories, and Story Dictionaries (this interactivity mimics typical in-class interactivity with content and is in lesson plans):
        1. Teacher designates target on content
        2. Teacher can designate 1 answerer or ask entire class
        3. Students can tap on content, if tap is withing target area teacher designated:  
            - a, If specific student (A) was chosen:  
                - A taps: target area revealed to all students  
                - ~A taps: target area revealed for that individual student  
                - No one taps: teacher can tap to reveal to all students  
            - b, If entire class was chosen:
                - Teacher has option to have the target revealed upon first tap (any student) OR upon teacher tap
    2. VPCs:
        1. Incorporate SWYK in Remote Teaching framework
            1. The actual inclusion of this feature would be up to curriculum… could be a brain break, transition activity, included in the “game” section as controlled by teacher.
3. Unity integration....: 3 parts:
    1. Unity integration in RT POC site
    2. Unity in Student site playlist
    3. Unity in Student App
4. Action Activities (Need to build sample to get input to request assets)
5. Phonograms, Phonogram Word Cards, (need to request assets and design)
6. Teacher Annotation
    1. Teacher can draw on content
        1. For now, just limit to 1 “brush”, but provide a few color options.
        2. Teacher will expand the view of content on their screen with toolbox for annotation, can still click through content as normal, but can draw on the content (circle things, underline things… (Video feeds are in background, partially covered… teacher is focused on drawing on the content, not looking at video feeds.)
        3. Option to allow student annotation: colors assigned to students by default, students draw on their screen, shows up everywhere
    2. Provide a “Quick Annotation” that uses only a cursor, teacher can move cursor symbol on the content in the normal teacher view to track with words, point to things, etc without “drawing” on the content. This will need to toggle with the “teacher defined target” interactivity feature since they overlap in UI and user actions
7. Incorporate Microsoft STT/NLU for Vocabulary Picture Cards and track responses from kids
    1. We will be making some algorithm to assess student “pronunciation”, even if it is just text. Comparing correct text with response from STT
    2. We will want to have a screen to display this information to teachers (outside of a live class) while also using highlighting or some other indicator to identify pass/fail pronunciation during a live class for the Teacher view only.
8. Chants, Songs (Latency management, brainstorm choral singing)
