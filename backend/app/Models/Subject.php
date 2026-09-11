<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'subjects';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'description',
    ];

    public function instructorProfiles()
    {
        return $this->belongsToMany(InstructorProfile::class, 'instructor_subjects', 'subject_id', 'instructor_id');
    }
}
